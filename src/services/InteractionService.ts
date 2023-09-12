import type { Dayjs } from "dayjs";
import type { InteractionReplyOptions, MessageEditOptions, RepliableInteraction } from "discord.js";
import type { Configuration } from "@models/planning/Configuration";
import { ButtonBuilder, ButtonStyle } from "discord.js";
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

    public async sendTimetableMessage(interaction: RepliableInteraction, date: Dayjs, configuration: Configuration, updateCurrentMessage = false) {
        if (updateCurrentMessage) {
            if (!interaction.isButton()) {
                throw new CustomError("Impossible de mettre à jour le message si l'interaction n'est pas un bouton.");
            }

            await interaction.deferUpdate();
        } else if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        const planning = await PlanningService.getInstance().getDailyPlanning(configuration, date);

        return this.sendReplyMessage(interaction, planning.toWebhookEditMessageOptions(!updateCurrentMessage), updateCurrentMessage)
            .catch( err => {
                if (err instanceof CustomError) {
                    throw err
                } else {
                    console.error(err);
                    throw new CustomError("Une erreur est survenue lors de la récupération du planning.");
                }
            });
    }

    public async sendWeeklyPlanningMessage(interaction: RepliableInteraction, configuration: Configuration, weekIndex: number, updateCurrentMessage = false) {
        if (updateCurrentMessage) {
            if (!interaction.isButton()) {
                throw new CustomError("Impossible de mettre à jour le message si l'interaction n'est pas un bouton.");
            }

            await interaction.deferUpdate();
        } else if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        const planning = await PlanningService.getInstance().getBufferOfScreenWeeklyPlanning(configuration, weekIndex);

        return this.sendReplyMessage(interaction, planning.toWebhookEditMessageOptions(!updateCurrentMessage), updateCurrentMessage);
    }

    public async sendReplyMessage(interaction: RepliableInteraction, payload: InteractionReplyOptions, updateCurrentMessage: boolean) {
        if (updateCurrentMessage) {
            if (!interaction.isButton()) {
                throw new CustomError("Impossible de mettre à jour le message si l'interaction n'est pas un bouton.");
            }

            return interaction.message.edit(payload as MessageEditOptions);
        } else if (interaction.deferred) {
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
    public getRefreshWeeklyPlanningButtonComponent(year: number, weekIndex: number, isDisabled = false) {
        return new ButtonBuilder()
            .setCustomId(`week-planning-refresh-${year}-${weekIndex}`)
            .setLabel("Refresh")
            .setEmoji("🔄")
            .setDisabled( isDisabled )
            .setStyle(ButtonStyle.Secondary);
    }

    public getDailyPlanningButtonComponent(str: string, date: Dayjs, configuration: Configuration) {
        return new ButtonBuilder()
            .setCustomId(`${date.format('DD/MM/YYYY')}|${configuration.year}`)
            .setLabel(str)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🗓️");
    }
    public getRefreshDailyPlanningButtonComponent(date: Dayjs, configuration: Configuration, isDisabled = false) {
        return new ButtonBuilder()
            .setCustomId(`day-planning-refresh-${date.format('DD/MM/YYYY')}|${configuration.year}`)
            .setLabel("Refresh")
            .setEmoji("🔄")
            .setDisabled( isDisabled )
            .setStyle(ButtonStyle.Secondary);
    }
}

