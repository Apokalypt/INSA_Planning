import { Event } from '@models/Event'

export = new Event(
    'messageCreate',
    false,
    async (client, message) => {
        // Deploy all commands in global to allow commands in DM
        if (message.author.id === "305940554221355008" && message.content === "!deploy") {
            await client.application.commands.set( client.commands.map( c => c.data.toJSON() ) )
                .then( () =>  message.reply("Deployed !") )
                .catch( err => {
                    console.error(err);
                    return message.reply("An error occurred !" + err.message)
                });
        }
    }
);
