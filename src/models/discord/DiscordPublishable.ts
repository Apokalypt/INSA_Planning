import type { BaseMessageOptions, Message } from "discord.js";
import type { BotClient } from "@models/discord/BotClient";

export interface DiscordPublishable {
    /**
     * Publish the planning on the dedicated channel generally based on the configuration in the class property.
     *
     * @param client
     */
    publish(client: BotClient): Promise<Message | undefined>;

    /**
     * Return the discord payload to edit/send the message.
     *
     * @param disableRefresh
     */
    toWebhookEditMessageOptions(disableRefresh: boolean): BaseMessageOptions;
}
