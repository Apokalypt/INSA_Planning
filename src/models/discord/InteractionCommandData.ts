import type { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import type { ChatInputCommandInteraction } from "discord.js";
import type { BotClient } from "@models/discord/BotClient";

export interface InteractionCommandData {
    readonly data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    readonly execute: (client: BotClient, interaction: ChatInputCommandInteraction) => Promise<void>;
}
