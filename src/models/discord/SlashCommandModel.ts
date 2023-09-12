import type { ChatInputCommandInteraction } from "discord.js";
import type { BotClient } from "@models/discord/BotClient";

export interface SlashCommandModel {
    readonly data: any;
    readonly execute: (client: BotClient, interaction: ChatInputCommandInteraction) => Promise<any>;
}

// We use ChatInputCommandInteraction since we are ONLY using slash commands for the moment.
// If it changes, please update this type.
