import { Event } from '@models/Event'

export = new Event(
    'interactionCreate',
    false,
    async (client, interaction) => {
        if (interaction.isCommand()) client.emit('interactionCommand', interaction);
        if (interaction.isSelectMenu()) client.emit('interactionSelect', interaction);
        if (interaction.isButton()) client.emit('interactionButton', interaction);
    }
);
