import type { ClientEvents } from 'discord.js'
import type { CommandInteraction } from "discord.js";
import type { SelectMenuInteraction } from "discord.js";

/**
 * Custom bot event extending djs client events
 */
export interface BotEvents extends ClientEvents {
    interactionCommand: [CommandInteraction],
    interactionSelect: [SelectMenuInteraction],
}
