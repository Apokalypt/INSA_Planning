import type { Configuration } from "@models/Configuration";
import { IntentsBitField } from "discord.js";

export abstract class Constants {
    // DISCORD
    static readonly DISCORD_MAX_NUMBER_OPTIONS_SELECT_MENU = 25;
    static readonly DISCORD_BOT_TOKEN = process.env.INSA_PLANNING_BOT_TOKEN ?? '';
    static readonly DISCORD_BOT_INTENTS = [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildMessages
    ];

    // USER INFORMATION
    static readonly LOGIN = process.env.INSA_PLANNING_LOGIN ?? "";
    static readonly PASSWORD = process.env.INSA_PLANNING_PASSWORD ?? "";

    // AGENDA CONFIGURATIONS
    static readonly CONFIGURATIONS: Configuration[] = [
        {
            year: 3,
            planning: "https://servif-cocktail.insa-lyon.fr/EdT/3IFA.php",
            channel: "847206243277078529"
        },
        {
            year: 4,
            planning: "https://servif-cocktail.insa-lyon.fr/EdT/4IFA.php",
            channel: "902323485127376957"
        }
    ];

    static readonly REG_LESSON_FULL_DESCRIPTION = /(?<name>.*) \((?<room>.*) - (?<department>.*) - (?<building>.*)\) \[(?<type>(CM|TD|TP|EV|EDT))]/;
    static readonly REG_LESSON_SHORT_DESCRIPTION = /(?<name>.*) \[(?<type>(CM|TD|TP|EDT|EV))]/;

    static readonly REG_LESSON_START_TIME_WITH_PLACE = /(?<startHour>[0-2][0-9][h:][0-5][0-9])([ \u00A0]@[ \u00A0](?<place>.*))?/;
}
