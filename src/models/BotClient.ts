import type { ClientOptions } from 'discord.js'
import type { BotEvents } from './BotEvents'
import * as fs from 'fs'
import { Client } from 'discord.js'
import type { Event } from './Event'
import path from 'path'

/**
 * Extension of the djs client to add some data
 */
export class BotClient extends Client<true> {
  /* ======================= Properties ======================== */
    /**
     * Version of the bot find in 'package.json'
     */
    public readonly version: number;

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

      this._registerClientEvents();
    }

    /* ======================== Functions ======================== */
    /**
     * Register all client events placed in 'events' directory
     *
     * @private
     */
    private _registerClientEvents () {
      fs.readdirSync(path.join(__dirname, '..', 'events')).filter(file => file.endsWith('.js') || file.endsWith('.ts')).forEach((file) => {
        const event: Event<keyof BotEvents> = require(path.join(__dirname, '..', 'events', file))

        if (event.once) {
          this.once(event.name, (...args) => event.action(this, ...args));
        } else {
          this.on(event.name, (...args) => event.action(this, ...args));
        }
      })
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
