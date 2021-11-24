import type { Snowflake } from "discord.js";

export interface SWSSupervisor {
    readonly id: Snowflake;
    readonly begin: string;
    readonly end: string;
}
