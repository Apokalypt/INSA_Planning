import 'module-alias/register';

import { Intents } from 'discord.js'
import dotenv from 'dotenv'
import { BotClient } from '@models/BotClient'

// Setup for the dayjs library
import dayjs from 'dayjs'
import pluginUTC from 'dayjs/plugin/utc'
import pluginTimezone from 'dayjs/plugin/timezone'
import pluginDuration from 'dayjs/plugin/duration'
import 'dayjs/locale/fr'
dayjs.extend(pluginUTC)
dayjs.extend(pluginTimezone)
dayjs.extend(pluginDuration)
dayjs.locale('fr')

dotenv.config()

process.setMaxListeners(0)


console.info('[INFO] Starting the bot...');

BotClient.login({
    token: process.env.INSA_PLANNING_BOT_TOKEN ?? '',
    intents: [Intents.FLAGS.GUILDS]
}).then(_ => null);
