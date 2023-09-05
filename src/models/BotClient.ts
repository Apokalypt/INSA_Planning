import type { ClientOptions } from 'discord.js'
import type { BotEvents } from './BotEvents'
import type { Event } from './Event'
import type { InteractionCommandData } from "@models/InteractionCommandData";
import path from 'path'
import * as fs from 'fs'
import { Collection } from 'discord.js'
import { Client } from 'discord.js'

/**
 * Extension of the djs client to add some data
 */
export class BotClient extends Client<true> {
  /* ======================= Properties ======================== */
    /**
     * Version of the bot find in 'package.json'
     */
    public readonly version: number;
    /**
     * Collection of all commands, the key is the commands name
     */
    public readonly commands: Collection<string, InteractionCommandData>;

    /* ======================= Constructor ======================= */
    /**
     * Call the parent constructor, assign all value and register events + mongoose change stream
     *
     * @param options Client options used by djs
     * @private
     */
    private constructor (options: ClientOptions) {
      super(options);

      this.version = require('../../package.json').version;
      this.commands = new Collection<string, InteractionCommandData>();


        this._registerClientEvents();
        this._registerCommands();
    }

    /* ======================== Functions ======================== */
    /**
     * Register all client events placed in 'events' directory
     *
     * @private
     */
    private _registerClientEvents () {
      fs.readdirSync(path.join(__dirname, '..', 'events')).filter(file => file.endsWith('.js') || file.endsWith('.ts')).forEach((file) => {
        const event: Event<keyof BotEvents> = require(path.join(__dirname, '..', 'events', file));

        if (event.once) {
          this.once(event.name, (...args) => event.action(this, ...args));
        } else {
          this.on(event.name, (...args) => event.action(this, ...args));
        }
      })
    }

    private _registerCommands() {
        fs.readdirSync(`${__dirname}/../commands/slash`).filter(file => file.endsWith('.js') || file.endsWith('.ts')).forEach((file) => {
            const command: InteractionCommandData = require(`${__dirname}/../commands/slash/${file}`);
            this.commands.set(command.data.name, command);
        });
    }

    /* ==================== Override function ==================== */
    override emit<K extends keyof BotEvents> (event: K, ...args: BotEvents[K]): boolean {
      // @ts-ignore
      return super.emit(event, ...args);
    }

    override on<K extends keyof BotEvents> (event: K, listener: (...args: BotEvents[K]) => void): this {
      // @ts-ignore
      return super.on(event, listener);
    }

    override once<K extends keyof BotEvents> (event: K, listener: (...args: BotEvents[K]) => void): this {
      // @ts-ignore
      return super.once(event, listener);
    }

    /* ===================== Static function ===================== */
    /**
     * Login function to create an instance of BotClient logging in Discord
     *
     * @param options Client option with token to log in Discord
     */
    public static async login (options: ClientOptions & { token: string }): Promise<BotClient> {
      const client = new BotClient(options);
      await client.login(options.token);

      await client.application.fetch();

      return client;
    }
}
