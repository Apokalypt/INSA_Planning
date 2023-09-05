import { CronJob } from 'cron';
import dayjs from "dayjs";
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
            // Plan a cron task to be executed the sunday, monday, tuesday, wednesday and thursday at 20:00 UTC+01:00
            const cronJob: CronJob = new CronJob(i + " 19 * * 0,1,2,3,4", async () => {
                const datePlanning = dayjs().tz("Europe/Paris").add(1, 'day');
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
            });

            // Start job
            if (!cronJob.running) {
                cronJob.start();
            }
        });

        console.info('[INFO] Ready to be used');
    }
);
