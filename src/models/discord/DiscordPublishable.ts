import type { BaseMessageOptions, Message } from "discord.js";
import type { BotClient } from "@models/discord/BotClient";
import type { Configuration } from "@models/planning/Configuration";
import { Constants } from "@constants";

export abstract class DiscordPublishable {
    protected readonly _configuration: Configuration;

    protected constructor(configuration: Configuration) {
        this._configuration = configuration;
    }


    /**
     * Publish the planning on the dedicated channel based on the configuration in the class property.
     *
     * @param client
     */
    async publish(client: BotClient): Promise<Message | undefined> {
        return client.channels.fetch(this._configuration.channel)
            .then( async channel => {
                if (!channel?.isTextBased()) {
                    return undefined;
                }

                return channel.send( this.toWebhookEditMessageOptions(false) );
            })
            .catch( async err => {
                console.error(err);

                const channel = await client.channels.fetch(Constants.DISCORD_CHANNEL_ID_ON_ERROR);
                if (!channel?.isTextBased()) {
                    return undefined;
                }

                return channel.send({
                    content: `Une erreur est survenue lors de l'envoi du planning des "${this._configuration.name}": ${err.message}`
                });
            })
            .catch( err => {
                console.error("An error occurred while sending error message", err);
                return undefined;
            });
    }

    /**
     * Return the discord payload to edit/send the message.
     *
     * @param disableRefresh
     */
    abstract toWebhookEditMessageOptions(disableRefresh: boolean): BaseMessageOptions;
}
