import dayjs from "dayjs";
import { Event } from '@models/Event'
import { InteractionService } from "@services/InteractionService";
import { Constants } from "@constants";

export = new Event(
    'interactionSelect',
    false,
    async (client, interaction) => {
        switch (interaction.customId) {
            case 'planning-date-select-menu':
                const [dateString, year] = interaction.values[0].split('|');
                const configuration = Constants.CONFIGURATIONS.find( c => c.year === Number(year) );
                if (!configuration) {
                    return interaction.reply({ ephemeral: true, content: "Impossible de trouver la configuration." });
                }

                const date = dayjs.tz(dateString, "DD/MM/YYYY", "Europe/Paris");

                await InteractionService.getInstance().sendTimetableMessage(interaction, date, configuration)
                    .catch( e => InteractionService.getInstance().handleErrorMessage(interaction, e) );
                break;
            default:
                await interaction.reply({
                    content: "Impossible de déterminer l'action à réaliser...",
                    ephemeral: true
                });

                break;
        }
    }
);
