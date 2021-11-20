import { Event } from '@models/Event'
import { DailyPlanning } from "@models/DailyPlanning";
import dayjs from "dayjs";

export = new Event(
    'interactionButton',
    false,
    async (client, interaction) => {
        const dateString = interaction.customId;
        const date = dayjs.tz(dateString, "DD/MM/YYYY", "Europe/Paris");

        await interaction.deferReply({ ephemeral: true });

        await DailyPlanning.fetchDailyPlanning(date)
            .then( async timetable => {
                return interaction.editReply(timetable.toWebhookEditMessageOptions());
            })
            .catch(_ => {
                return interaction.editReply({
                    content: `Je n'ai pas trouvé de planning correspondant à la date saisie ( <t:${date.unix()}:D> )`
                });
            });
    }
);
