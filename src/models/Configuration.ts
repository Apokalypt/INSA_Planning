import type { Snowflake } from "discord.js";
import type { CronJob } from "cron";

export interface Configuration {
    year: number;
    planning: string;
    channel: Snowflake;
    name: string;
    cron: {
        daily?: CronJob;
        weekly?: CronJob;
    }
}
