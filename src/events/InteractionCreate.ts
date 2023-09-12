import { Event } from '@models/discord/Event'

export = new Event(
    'interactionCreate',
    false,
    async (client, interaction) => {
        if (interaction.isChatInputCommand()) {
            client.emit('interactionCommand', interaction);
            return;
        }
        if (interaction.isStringSelectMenu()) {
            client.emit('interactionSelect', interaction);
            return;
        }
        if (interaction.isButton()) {
            client.emit('interactionButton', interaction);
            return;
        }
    }
);
