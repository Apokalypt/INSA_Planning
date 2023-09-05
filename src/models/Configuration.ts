import type { Snowflake } from "discord.js";

export interface Configuration {
    year: number;
    planning: string;
    channel: Snowflake;
}
