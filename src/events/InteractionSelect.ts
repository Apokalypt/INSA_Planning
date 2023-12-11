import dayjs from "dayjs";
import { Event } from '@models/discord/Event'
import { InteractionService } from "@services/InteractionService";
import { Constants } from "@constants";

export = new Event(
    'interactionSelect',
    false,
    async (_client, interaction) => {
        try {
            if (interaction.customId === 'planning-date-select-menu') {
                const [dateString, year] = interaction.values[0].split('|');
                const configuration = Constants.CONFIGURATIONS.find( c => c.year === Number(year) );
                if (!configuration) {
                    await interaction.reply({ ephemeral: true, content: "Impossible de trouver la configuration." });
                    return;
                }

                const date = dayjs.tz(dateString, "DD/MM/YYYY", Constants.TIMEZONE);

                await InteractionService.getInstance().sendTimetableMessage(interaction, date, configuration)
                    .catch( e => InteractionService.getInstance().handleErrorMessage(interaction, e) );
            } else {
                await InteractionService.getInstance().sendReplyMessage(
                    interaction,
                    {
                        content: "Impossible de déterminer l'action à réaliser...",
                        ephemeral: true
                    },
                    false
                );
            }
        } catch (e) {
            await InteractionService.getInstance().handleErrorMessage(interaction, e)
                .catch( console.error );
        }
    }
);
