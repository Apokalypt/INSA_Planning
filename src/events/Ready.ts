import type { BotClient } from "@models/discord/BotClient";
import dayjs from "dayjs";
import { CronJob } from 'cron';
import { Event } from '@models/discord/Event'
import { DateService } from "@services/DateService";
import { PlanningService } from "@services/PlanningService";
import { Constants } from "@constants";

export = new Event(
    'ready',
    true,
    async (client) => {
        console.info('[INFO] Connected to Discord\'s server');

        // During the first seconds, the Node.js process is using the double of RAM
        // Delay the initialization of the planning service to avoid overuse of CPU/RAM and so delay cron jobs
        //  initialization
        setTimeout( () => {
            PlanningService.getInstance().initialize( () => initializeCronJobsForAllConfigurations(client) );
        }, 5_000);

        console.info('[INFO] Ready to be used');
    }
);

function initializeCronJobsForAllConfigurations(client: BotClient) {
    Constants.CONFIGURATIONS.map( (conf, i) => {
        // Plan a cron task to be executed the sunday, monday, tuesday, wednesday and thursday at 20:00 Europe/Paris
        conf.cron.daily?.stop();
        conf.cron.daily = new CronJob(i + " 20 * * 0,1,2,3,4", async () => {
            const datePlanning = dayjs().tz(Constants.TIMEZONE).add(1, 'day');
            if (!DateService.getInstance().isWorkDay(datePlanning)) {
                // If it's the weekend, do nothing
                return;
            }

            // Retrieve timetable for a specific day
            return PlanningService.getInstance()
                .getDailyPlanning(conf, datePlanning)
                .then( async planning => {
                    if (planning.isDuringEnterprisePeriod()) {
                        return;
                    }

                    // Send an embed with planning for the next day
                    return planning.publish(client);
                })
                .catch( async err => {
                    console.error(err);

                    const channel = await client.channels.fetch(Constants.DISCORD_CHANNEL_ID_ON_ERROR);
                    if (!channel?.isTextBased()) {
                        return;
                    }

                    return channel.send({
                        content: `Une erreur est survenue lors de l'envoi du planning des "${conf.name}": ${err.message}`
                    });
                });
        }, undefined, true, Constants.TIMEZONE, undefined, false);

        // Plan a cron task to be executed the saturday at 20:00 Europe/Paris
        conf.cron.weekly?.stop();
        conf.cron.weekly = new CronJob(i + " 20 * * 6", async () => {
            return PlanningService.getInstance()
                .getBufferOfScreenWeeklyPlanning(conf, DateService.getInstance().getNextWeekIndex())
                .then( async planning => planning.publish(client) )
                .catch( async err => {
                    console.error(err);

                    const channel = await client.channels.fetch(Constants.DISCORD_CHANNEL_ID_ON_ERROR);
                    if (!channel?.isTextBased()) {
                        return;
                    }

                    return channel.send({
                        content: `Une erreur est survenue lors de l'envoi du planning des "${conf.name}": ${err.message}`
                    });
                });
        }, undefined, true, Constants.TIMEZONE, undefined, false);
    });
}
