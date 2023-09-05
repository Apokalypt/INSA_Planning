import { Event } from '@models/Event'
import { InteractionService } from "@services/InteractionService";

export = new Event(
    'interactionCommand',
    false,
    async (client, interaction) => {
        try {
            const command = client.commands.get(interaction.commandName);
            if (command) {
                await command.execute(client, interaction);
            } else {
                throw new Error(`Unknown command ${interaction.commandName}...`);
            }
        } catch (e) {
            await InteractionService.getInstance().handleErrorMessage(interaction, e)
                .catch( console.error );
        }
    }
);
