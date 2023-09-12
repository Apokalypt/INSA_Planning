console.info('[INFO] Initialize modules/libraries...');

import 'module-alias/register';

import dotenv from 'dotenv'
if (process.env.ENV == "local") {
    dotenv.config();
}

import { BotClient } from '@models/discord/BotClient'
import { Constants } from "@constants";

// Setup for the dayjs library
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
dayjs.locale('fr');
import pluginUTC from 'dayjs/plugin/utc'
dayjs.extend(pluginUTC);
import pluginTimezone from 'dayjs/plugin/timezone'
dayjs.extend(pluginTimezone);
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear);

console.info('[INFO] Starting the bot...');

BotClient.login({ token: Constants.DISCORD_BOT_TOKEN, intents: Constants.DISCORD_BOT_INTENTS })
    .then( null );
