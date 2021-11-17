import { Event } from '@models/Event'
import { CronJob } from 'cron';
import { DailyPlanning } from "@models/DailyPlanning";
import dayjs from "dayjs";

export = new Event(
    'ready',
    true,
    async (client) => {
        console.info('[INFO] Connected to Discord\'s server');

        // Plan a cron task to be executed the sunday, monday, tuesday, wednesday and thursday at 20:00 UTC+01:00
        const cronJob: CronJob = new CronJob("0 19 * * 0,1,2,3,4", async () => {
            // Retrieve timetable for a specific day
            await DailyPlanning.fetchDailyPlanning(dayjs().tz("Europe/Paris").add(1, 'day'))
                .then( timetable => {
                    // Send an embed with planning for the next day
                    return client.channels.fetch(process.env.INSA_PLANNING_CHANNEL_ID ?? "")
                        .then(async channel => {
                            if (channel?.isText()) await channel.send({ embeds: [ timetable.generateEmbed() ] });
                        })
                })
                .catch(err => {
                    console.error(err);

                    return client.channels.fetch("847206243277078529")
                        .then(async channel => {
                            // Send a message with error message that occurred
                            if (channel?.isText()) await channel.send({
                                content: '<@305940554221355008> Un bug est survenu : \n' + err.message
                            });
                        })
                });
        });
        // Start job
        if (!cronJob.running) cronJob.start();

        console.info('[INFO] Ready to be used');
    }
);
