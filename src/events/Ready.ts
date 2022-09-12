import { Event } from '@models/Event'
import { CronJob } from 'cron';
import { DailyPlanning } from "@models/DailyPlanning";
import dayjs from "dayjs";
import { Constants } from "@constants";

export = new Event(
    'ready',
    true,
    async (client) => {
        console.info('[INFO] Connected to Discord\'s server');

        /*
        // Plan SWS reminders for the current day or next day (depending on which cron job has been executed) if the
        // bot has restart
        let date = dayjs().tz("Europe/Paris");
        if (date.isSameOrAfter(dayjs().tz("Europe/Paris").hour(20).minute(0).second(0))) {
            date = date.add(1, 'day');
        }
        if (![6, 0].includes(date.day())) {
            // This is not the week-end so we need to plan the reminders.
            await DailyPlanning.fetchDailyPlanning(date)
                .then( planning => {
                    if (planning.isDuringEnterprisePeriod()) return;

                    return planning.planSWSReminders(client)
                } )
                .catch( _ => null );
        }
        */

        Constants.CONFIGURATIONS.map( (conf, i) => {
            // Plan a cron task to be executed the sunday, monday, tuesday, wednesday and thursday at 20:00 UTC+01:00
            const cronJob: CronJob = new CronJob(i + " 19 * * 0,1,2,3,4", async () => {
                const datePlanning = dayjs().tz("Europe/Paris").add(1, 'day');
                if ([6, 0].includes(datePlanning.day())) {
                    // If it's the weekend, do nothing
                    return;
                }

                // Retrieve timetable for a specific day
                await DailyPlanning.fetchDailyPlanning(conf, datePlanning)
                    .then( async planning => {
                        if (planning.isDuringEnterprisePeriod()) {
                            return;
                        }

                        // Send a message for each lesson to reminder that we need to sign on SWS
                        planning.planSWSReminders(client);

                        // Send an embed with planning for the next day
                        await planning.publish(conf, client);
                    })
                    .catch(err => {
                        console.error(err);

                        return client.channels.fetch("847206243277078529")
                            .then(async channel => {
                                // Send a message with error message that occurred
                                if (channel?.isText()) {
                                    await channel.send({
                                        content: '<@305940554221355008> Un bug est survenu : \n' + err.message
                                    });
                                }
                            })
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
