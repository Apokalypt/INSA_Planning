import type { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import type { BotClient } from "@models/BotClient";

export interface InteractionCommandData {
    readonly data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    readonly execute: (client: BotClient, interaction: CommandInteraction) => Promise<void>;
}
