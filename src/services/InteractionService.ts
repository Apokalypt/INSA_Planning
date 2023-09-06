import type { Dayjs } from "dayjs";
import type { InteractionReplyOptions, RepliableInteraction } from "discord.js";
import type { Configuration } from "@models/Configuration";
import { MessageActionRowComponentBuilder } from "@discordjs/builders";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { DateService } from "@services/DateService";
import { PlanningService } from "@services/PlanningService";
import { CustomError } from "@errors/CustomError";

export class InteractionService {
    private static _instance?: InteractionService;

    public static getInstance(): InteractionService {
        if (!this._instance) {
            this._instance = new InteractionService();
        }

        return this._instance;
    }

    public async sendTimetableMessage(interaction: RepliableInteraction, date: Dayjs, configuration: Configuration) {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        return PlanningService.getInstance().getDailyPlanning(configuration.planning, date)
            .then( async timetable => {
                return interaction.editReply(timetable.toWebhookEditMessageOptions(configuration));
            })
            .catch( err => {
                if (err instanceof CustomError) {
                    throw err
                } else {
                    console.error(err);
                    throw new CustomError("Une erreur est survenue lors de la récupération du planning.");
                }
            });
    }

    public async sendWeeklyPlanningMessage(interaction: RepliableInteraction, configuration: Configuration, weekIndex: number) {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        const buffer = await PlanningService.getInstance().getBufferOfScreenWeeklyPlanning(configuration, weekIndex);
        const attachmentPlanning = new AttachmentBuilder(buffer, { name: "planning.png" })

        await this.sendReplyMessage(
            interaction,
            {
                files: [attachmentPlanning],
                components: [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>()
                        .addComponents(
                            this.getWeeklyPlanningButtonComponent("Précédent", configuration.year, DateService.getInstance().getPreviousWeekIndex(weekIndex)),
                            this.getRefreshWeeklyPlanningButtonComponent(configuration.year, weekIndex),
                            this.getWeeklyPlanningButtonComponent("Suivant", configuration.year, DateService.getInstance().getNextWeekIndex(weekIndex))
                        )
                ],
                ephemeral: true
            }
        );
    }

    public async sendReplyMessage(interaction: RepliableInteraction, payload: InteractionReplyOptions) {
        if (interaction.deferred) {
            return interaction.editReply(payload);
        } else {
            return interaction.reply(payload);
        }
    }

    public async handleErrorMessage(interaction: RepliableInteraction, e: any) {
        if (!(e instanceof CustomError)) {
            console.error(e);
        }
        const error = e instanceof CustomError ? e : new CustomError("Unknown error!");

        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({ content: error.message }).catch(console.error);
        } else {
            return interaction.reply({ content: error.message, ephemeral: true }).catch(console.error);
        }
    }

    public getWeeklyPlanningButtonComponent(str: string, year: number, weekIndex: number) {
        return new ButtonBuilder()
            .setCustomId(`week-planning-${year}-${weekIndex}`)
            .setLabel(str)
            .setStyle(ButtonStyle.Primary);
    }
    public getRefreshWeeklyPlanningButtonComponent(year: number, weekIndex: number) {
        return new ButtonBuilder()
            .setCustomId(`week-planning-${year}-${weekIndex}`)
            .setLabel("\u200b")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
    }
}

