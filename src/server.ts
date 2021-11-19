import 'module-alias/register';

import { Intents } from 'discord.js'
import dotenv from 'dotenv'
import { BotClient } from '@models/BotClient'

// Setup for the dayjs library
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
dayjs.locale('fr')
import pluginUTC from 'dayjs/plugin/utc'
dayjs.extend(pluginUTC)
import pluginTimezone from 'dayjs/plugin/timezone'
dayjs.extend(pluginTimezone)
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

dotenv.config()

process.setMaxListeners(0)


console.info('[INFO] Starting the bot...');

BotClient.login({
    token: process.env.INSA_PLANNING_BOT_TOKEN ?? '',
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES]
}).then(_ => null);
