import type { BotEvents } from './BotEvents'
import type { BotClient } from './BotClient'

/**
 * Custom event class to define action to be realised
 */
export class Event<K extends keyof BotEvents> {
  /* ================ PROPERTIES ================ */
    /**
     * Name of the event (value inside BotEvents enum)
     */
    public readonly name: K;
    /**
     * Indicate if this event definition should be executed only one time or not
     */
    public readonly once: Boolean;
    /**
     * Coded to be executed once the event is emit
     */
    public readonly action: (client: BotClient, ...args: BotEvents[K]) => void;

    /* =============== CONSTRUCTOR ================ */
    public constructor (name: K, once: Boolean, action: (client: BotClient, ...args: BotEvents[K]) => void) {
      this.name = name
      this.once = once
      this.action = action
    }
}
