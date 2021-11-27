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
            const datePlanning = dayjs().tz("Europe/Paris").add(1, 'day');
            if ([6, 0].includes(datePlanning.day())) {
                // If it's the weekend, do nothing
                return;
            }

            // Retrieve timetable for a specific day
            await DailyPlanning.fetchDailyPlanning(datePlanning)
                .then( async planning => {
                    if (planning.lessons.length === 1 && planning.lessons[0].title.match(/Période entreprise ([0-9]+) \(Entreprise \1\)/)) {
                        // It's an enterprise period, do nothing
                        return;
                    }

                    // Send a message for each lesson to reminder that we need to sign on SWS
                    planning.planSWSReminders(client);

                    // Send an embed with planning for the next day
                    await planning.publish(client);
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
