import type { PuppeteerLaunchOptions } from "puppeteer";
import type { Configuration } from "@models/planning/Configuration";
import { GatewayIntentBits } from "discord.js";

export abstract class Constants {
    // PUPPETEER
    static readonly PUPPETEER_OPTIONS: PuppeteerLaunchOptions = {
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }

    // DISCORD
    static readonly DISCORD_MAX_NUMBER_OPTIONS_SELECT_MENU = 25;
    static readonly DISCORD_BOT_TOKEN = process.env.INSA_PLANNING_BOT_TOKEN ?? '';
    static readonly DISCORD_BOT_INTENTS = [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ];

    // USER INFORMATION
    static readonly LOGIN = process.env.INSA_PLANNING_LOGIN ?? "";
    static readonly PASSWORD = process.env.INSA_PLANNING_PASSWORD ?? "";

    // AGENDA CONFIGURATIONS
    static readonly TIMEZONE = "Europe/Paris";
    static readonly CONFIGURATIONS: Configuration[] = [
        {
            year: 3,
            planning: "https://servif-cocktail.insa-lyon.fr/EdT/3IFA.php",
            channel: "1143301054625226813",
            name: "3IFA",
            cron: { }
        },
        {
            year: 4,
            planning: "https://servif-cocktail.insa-lyon.fr/EdT/4IFA.php",
            channel: "885433068511428648",
            name: "4IFA",
            cron: { }
        }
    ];

    static readonly REG_LESSON_FULL_DESCRIPTION = /(?<name>.*) \((?<room>.*) - (?<department>.*) - (?<building>.*)\) \[(?<type>(CM|TD|TP|EV|EDT))]/;
    static readonly REG_LESSON_SHORT_DESCRIPTION = /(?<name>.*) \[(?<type>(CM|TD|TP|EDT|EV))]/;

    static readonly REG_LESSON_START_TIME_WITH_PLACE = /(?<startHour>[0-2][0-9][h:][0-5][0-9])([ \u00A0]@[ \u00A0](?<place>.*))?/;

    static readonly DISCORD_CHANNEL_ID_ON_ERROR = "859153422540734490";
}
