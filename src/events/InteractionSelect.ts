import { Event } from '@models/Event'
import { DailyPlanning } from "@models/DailyPlanning";
import dayjs from "dayjs";
import { Constants } from "@constants";

export = new Event(
    'interactionSelect',
    false,
    async (client, interaction) => {
        switch (interaction.customId) {
            case 'planning-date-select-menu': {
                const [dateString, year] = interaction.values[0].split('|');
                const configuration = Constants.CONFIGURATIONS.find( c => c.year === Number(year) );
                if (!configuration) {
                    return interaction.reply({ ephemeral: true, content: "Impossible de trouver la configuration." });
                }

                const date = dayjs.tz(dateString, "DD/MM/YYYY", "Europe/Paris");

                await interaction.deferReply({ ephemeral: true });

                await DailyPlanning.fetchDailyPlanning(configuration, date)
                    .then( async timetable => {
                        return interaction.editReply(timetable.toWebhookEditMessageOptions(configuration));
                    })
                    .catch(_ => {
                        return interaction.editReply({
                            content: `Je n'ai pas trouvé de planning correspondant à la date saisie ( <t:${date.unix()}:D> )`
                        });
                    });
                break;
            }
            default: {
                await interaction.reply({
                    content: "Impossible de déterminer l'action à réaliser...",
                    ephemeral: true
                });

                break;
            }
        }
    }
);
