import type { ElementHandle } from "puppeteer";
import type { BotClient } from "@models/discord/BotClient";
import type { Configuration } from "@models/planning/Configuration";
import type { DiscordPublishable } from "@models/discord/DiscordPublishable";
import { MessageActionRowComponentBuilder } from "@discordjs/builders";
import { ActionRowBuilder, AttachmentBuilder, BaseMessageOptions } from "discord.js";
import { DateService } from "@services/DateService";
import { InteractionService } from "@services/InteractionService";

export class WeeklyPlanning implements DiscordPublishable {
    private readonly _configuration: Configuration;
    private readonly _index: number;
    private readonly _table: ElementHandle;
    private readonly _buffer: Buffer;


    constructor(configuration: Configuration, index: number, table: ElementHandle, bufferOrString: Buffer | string) {
        this._configuration = configuration;
        this._index = index;
        this._table = table;
        this._buffer = bufferOrString instanceof Buffer ? bufferOrString : Buffer.from(bufferOrString, "base64");
    }


    toWebhookEditMessageOptions(disableRefresh: boolean): BaseMessageOptions {
        const fileName = `planning-${this._configuration.name}-S${this._index}.png`;
        const attachment = new AttachmentBuilder(this._buffer, { name: fileName });

        const service = InteractionService.getInstance();

        return {
            content: `# [${this._configuration.name}] Planning semaine ${this._index}`,
            files: [attachment],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>()
                    .addComponents(
                        service.getWeeklyPlanningButtonComponent(
                            "Précédent",
                            this._configuration.year,
                            DateService.getInstance().getPreviousWeekIndex(this._index)
                        ),
                        service.getRefreshWeeklyPlanningButtonComponent(this._configuration.year, this._index, disableRefresh),
                        service.getWeeklyPlanningButtonComponent(
                            "Suivant",
                            this._configuration.year,
                            DateService.getInstance().getNextWeekIndex(this._index)
                        )
                    )
            ],
        };
    }

    /**
     * Publish the weekly planning on the dedicated channel
     *
     * @param client
     */
    async publish(client: BotClient) {
        return client.channels.fetch(this._configuration.channel)
            .then(async channel => {
                if (!channel?.isTextBased()) {
                    return;
                }

                return channel.send( this.toWebhookEditMessageOptions(false) );
            })
    }
}
