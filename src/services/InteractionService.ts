import type { Dayjs } from "dayjs";
import type { RepliableInteraction, InteractionReplyOptions } from "discord.js";
import type { Configuration } from "@models/Configuration";
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
            return interaction.deferReply({ ephemeral: true });
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
}

