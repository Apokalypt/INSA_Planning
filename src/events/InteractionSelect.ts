import { Event } from '@models/Event'
import { DailyPlanning } from "@models/DailyPlanning";
import dayjs from "dayjs";

export = new Event(
    'interactionSelect',
    false,
    async (client, interaction) => {
        switch (interaction.customId) {
            case 'planning-date-select-menu': {
                const dateString = interaction.values[0];
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
                break;
            }
            default:{
                await interaction.reply({
                    content: "Impossible de déterminer l'action à réaliser...",
                    ephemeral: true
                });

                break;
            }
        }
    }
);
