import type { Configuration } from "@models/planning/Configuration";
import { MessageActionRowComponentBuilder } from "@discordjs/builders";
import { ActionRowBuilder, AttachmentBuilder, BaseMessageOptions } from "discord.js";
import { DiscordPublishable } from "@models/discord/DiscordPublishable";
import { DateService } from "@services/DateService";
import { InteractionService } from "@services/InteractionService";

export class WeeklyPlanning extends DiscordPublishable {
    private readonly _index: number;
    private readonly _buffer: Buffer;


    constructor(configuration: Configuration, index: number, bufferOrString: Buffer | string) {
        super(configuration);

        this._index = index;
        this._buffer = bufferOrString instanceof Buffer ? bufferOrString : Buffer.from(bufferOrString, "base64");
    }


    override toWebhookEditMessageOptions(disableRefresh: boolean): BaseMessageOptions {
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
}
