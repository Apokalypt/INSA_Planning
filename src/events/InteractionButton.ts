import { Event } from '@models/Event'
import { DailyPlanning } from "@models/DailyPlanning";
import dayjs from "dayjs";
import { Constants } from "@constants";

export = new Event(
    'interactionButton',
    false,
    async (client, interaction) => {
        const [dateString, year] = interaction.customId.split('|');
        const configuration = Constants.CONFIGURATIONS.find( c => c.year === Number(year ?? "3") );
        if (!configuration) {
            return interaction.reply({ ephemeral: true, content: "Impossible de trouver la configuration." });
        }

        const date = dayjs.tz(dateString, "DD/MM/YYYY", "Europe/Paris");

        await interaction.deferReply({ ephemeral: true });

        await DailyPlanning.fetchDailyPlanning(configuration, date)
            .then( async timetable => {
                return interaction.editReply(timetable.toWebhookEditMessageOptions(configuration));
            })
            .catch( _ => {
                return interaction.editReply({
                    content: `Je n'ai pas trouvé de planning correspondant à la date saisie ( <t:${date.unix()}:D> )`
                });
            });
    }
);
