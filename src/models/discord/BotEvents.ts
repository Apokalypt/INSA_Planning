import type { ClientEvents, SelectMenuInteraction, ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'

/**
 * Custom bot event extending djs client events
 */
export interface BotEvents extends ClientEvents {
    interactionCommand: [ChatInputCommandInteraction],
    interactionSelect: [SelectMenuInteraction],
    interactionButton: [ButtonInteraction]
}
