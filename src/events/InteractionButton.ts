import dayjs from "dayjs";
import { Event } from '@models/Event'
import { InteractionService } from "@services/InteractionService";
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

        const date = dayjs.tz(dateString, "DD/MM/YYYY", Constants.TIMEZONE);

        await InteractionService.getInstance().sendTimetableMessage(interaction, date, configuration)
            .catch( e => InteractionService.getInstance().handleErrorMessage(interaction, e) )
            .catch( console.error );
    }
);
