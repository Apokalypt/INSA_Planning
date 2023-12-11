import { Event } from '@models/discord/Event'

export = new Event(
    'interactionCreate',
    false,
    async (client, interaction) => {
        if (interaction.isChatInputCommand()) {
            client.emit('interactionCommand', interaction);
        } else if (interaction.isStringSelectMenu()) {
            client.emit('interactionSelect', interaction);
            return;
        } else if (interaction.isButton()) {
            client.emit('interactionButton', interaction);
        }
    }
);
