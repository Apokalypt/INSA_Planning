import dayjs from "dayjs";
import { CronJob } from 'cron';
import { AttachmentBuilder } from "discord.js";
import { Event } from '@models/Event'
import { DateService } from "@services/DateService";
import { PlanningService } from "@services/PlanningService";
import { Constants } from "@constants";

export = new Event(
    'ready',
    true,
    async (client) => {
        console.info('[INFO] Connected to Discord\'s server');

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
                await PlanningService.getInstance().getDailyPlanning(conf.planning, datePlanning)
                    .then( async planning => {
                        if (planning.isDuringEnterprisePeriod()) {
                            return;
                        }

                        // Send an embed with planning for the next day
                        return planning.publish(conf, client);
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
                const channel = await client.channels.fetch(conf.channel);
                if (!channel?.isTextBased()) {
                    return;
                }

                const nextWeekIndex = DateService.getInstance().getNextWeekIndex();
                const buffer = await PlanningService.getInstance().getBufferOfScreenWeeklyPlanning(conf, nextWeekIndex);

                const planningAttachment = new AttachmentBuilder(buffer, { name: `planning-${conf.name}-${nextWeekIndex}.png` });
                await channel.send({ content: `# [${conf.name}] Planning semaine ${nextWeekIndex}`, files: [planningAttachment] });
            }, undefined, true, Constants.TIMEZONE, undefined, false);
        });

        console.info('[INFO] Ready to be used');
    }
);
