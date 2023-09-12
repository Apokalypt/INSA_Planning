import type { Dayjs } from "dayjs";
import type { Lesson } from "@models/planning/Lesson";
import type { BotClient } from "@models/BotClient";
import { MessageActionRowComponentBuilder } from "@discordjs/builders";
import { ActionRowBuilder, BaseMessageOptions, Colors, EmbedBuilder } from "discord.js";
import { Utils } from "@models/Utils";
import { Configuration } from "@models/Configuration";
import { InteractionService } from "@services/InteractionService";

export class DailyPlanning {
    lessons: Lesson[];
    date: Dayjs;
    lastUpdatedAt: Dayjs;


    constructor(lessons: Lesson[], date: Dayjs, lastUpdatedAt: Dayjs) {
        this.lessons = lessons;
        this.date = date;
        this.lastUpdatedAt = lastUpdatedAt;
    }


    /**
     * Generate webhook edit options from the current daily planning
     */
    toWebhookEditMessageOptions(configuration: Configuration, disableRefresh: boolean): BaseMessageOptions {
        const datePrevious = this.date.subtract(this.date.day() === 1 ? 3 : 1, 'day');
        const dateNext = this.date.add(this.date.day() === 5 ? 3 : 1, 'day');

        const service = InteractionService.getInstance();

        return {
            embeds: [this._toEmbed(configuration.planning)],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>()
                    .addComponents(
                        service.getDailyPlanningButtonComponent("Précédent", datePrevious, configuration),
                        service.getRefreshDailyPlanningButtonComponent(this.date, configuration, disableRefresh),
                        service.getDailyPlanningButtonComponent("Suivant", dateNext, configuration)
                    )
            ],
        };
    }


    /**
     * Publish the daily planning on the dedicated channel
     *
     * @param configuration
     * @param client
     */
    async publish(configuration: Configuration, client: BotClient) {
        return client.channels.fetch(configuration.channel)
            .then(async channel => {
                if (!channel?.isTextBased()) {
                    return;
                }

                await channel.send( this.toWebhookEditMessageOptions(configuration, false) );
            })
    }

    /**
     * Indicate if the daily planning is during an enterprise period.
     */
    public isDuringEnterprisePeriod(): boolean {
        return this.lessons.length === 1
            && (
                this.lessons[0].title.match(/Période entreprise (\d+) \(Entreprise \1\)/) != null
                ||
                this.lessons[0].title.match(/Créneau (\d+)IFA \((\d+)IFA Entreprise (\d+) - Promotion IFA (\d+)-(\d+)\)/) != null
                ||
                this.lessons[0].title.match(/Créneau Groupe \((\d+)IFA Entreprise (\d+) - Promotion IFA (\d+)-(\d+)\)/) != null
            );
    }

    /**
     * Generate an embed message based on the daily planning
     */
    private _toEmbed(planning: string): EmbedBuilder {
        const title = Utils.bold(":calendar:  Emploi du temps du <t:" + this.date.hour(0).minute(0).unix() + ":D> :");
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setURL(planning)
            .setFooter({ text: "Dernière mise à jour : " + this.lastUpdatedAt.format('DD/MM/YYYY HH:mm') });

        if (this.lessons.length === 0) {
            return embed.setColor(Colors.Green)
                .setDescription("Vous n'avez pas de cours programmé pour aujourd'hui. Reposez-vous bien :thumbsup:");
        } else if (this.isDuringEnterprisePeriod()) {
            return embed.setColor(Colors.Blue)
                .setDescription("Vous êtes en période entreprise. Bon courage :muscle:");
        } else {
            embed.setColor(Colors.Yellow);

            let lastLesson: Lesson;
            this.lessons.forEach( lesson => {
                embed.setDescription(
                    (embed.data.description ?? '') +
                    `${!lastLesson || lastLesson.endDate.isSame(lesson.startDate) ? "\n" : "\n\n-----\n\n"}` +
                    lesson.toStringEmbed()
                );
                lastLesson = lesson;
            });

            return embed;
        }
    }
}
