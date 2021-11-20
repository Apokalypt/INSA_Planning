import { Event } from '@models/Event'

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
            console.error(e);
            const error = e instanceof Error ? e : new Error("Unknown error!");

            if (interaction.deferred) {
                await interaction.editReply({ content: error.message });
            } else if (interaction.replied) {
                await interaction.followUp({ content: error.message, ephemeral: true });
            } else {
                await interaction.reply({ content: error.message, ephemeral: true });
            }
        }
    }
);
