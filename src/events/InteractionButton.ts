import dayjs from "dayjs";
import { Event } from '@models/Event'
import { InteractionService } from "@services/InteractionService";
import { Constants } from "@constants";

export = new Event(
    'interactionButton',
    false,
    async (_client, interaction) => {
        try {
            const id = interaction.customId;

            if (id.startsWith('week-planning-refresh')) {
                const args = id.split('-');
                const year = Number(args[3]);
                const weekIndex = Number(args[4]);

                const configuration = Constants.CONFIGURATIONS.find( c => c.year === year);
                if (!configuration) {
                    return interaction.reply({ ephemeral: true, content: "Impossible de trouver la configuration." });
                }

                await InteractionService.getInstance()
                    .sendWeeklyPlanningMessage(interaction, configuration, weekIndex, true);
            } else if (id.startsWith('week-planning')) {
                const args = id.split('-');
                const year = Number(args[2]);
                const weekIndex = Number(args[3]);

                const configuration = Constants.CONFIGURATIONS.find( c => c.year === year);
                if (!configuration) {
                    return interaction.reply({ ephemeral: true, content: "Impossible de trouver la configuration." });
                }

                await InteractionService.getInstance()
                    .sendWeeklyPlanningMessage(interaction, configuration, weekIndex);
            }  else if (id.startsWith('day-planning-refresh')) {
                const args = id.split('-');

                const data = args[3];
                const [dateString, year] = data.split('|');

                const configuration = Constants.CONFIGURATIONS.find( c => c.year === Number(year ?? "3") );
                if (!configuration) {
                    return interaction.reply({ ephemeral: true, content: "Impossible de trouver la configuration." });
                }

                const date = dayjs.tz(dateString, "DD/MM/YYYY", Constants.TIMEZONE);

                await InteractionService.getInstance().sendTimetableMessage(interaction, date, configuration, true)
                    .catch( e => InteractionService.getInstance().handleErrorMessage(interaction, e) )
                    .catch( console.error );
            } else {
                const [dateString, year] = id.split('|');
                const configuration = Constants.CONFIGURATIONS.find( c => c.year === Number(year ?? "3") );
                if (!configuration) {
                    return interaction.reply({ ephemeral: true, content: "Impossible de trouver la configuration." });
                }

                const date = dayjs.tz(dateString, "DD/MM/YYYY", Constants.TIMEZONE);

                await InteractionService.getInstance().sendTimetableMessage(interaction, date, configuration)
                    .catch( e => InteractionService.getInstance().handleErrorMessage(interaction, e) )
                    .catch( console.error );
            }
        } catch (e) {
            await InteractionService.getInstance().handleErrorMessage(interaction, e)
                .catch( console.error );
        }
    }
);
