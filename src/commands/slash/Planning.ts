import type { SlashCommandModel } from "@models/discord/SlashCommandModel";
import { ComponentType, SelectMenuComponentOptionData } from "discord.js";
import { SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "@discordjs/builders";
import { DateService } from "@services/DateService";
import { InteractionService } from "@services/InteractionService";
import { Constants } from "@constants";

const ARGS_NAME_DATE: string = "date";
const ARGS_NAME_YEAR: string = "année-étude";

export = {
    data: new SlashCommandBuilder()
        .setName("planning")
        .setDescription("Affiche le planning d'une date donnée.")
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName(ARGS_NAME_YEAR)
                .setDescription("Année d'étude")
                .addChoices(
                    { value: 3, name: "3IFA" },
                    { value: 4, name: "4IFA" }
                )
                .setRequired(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName(ARGS_NAME_DATE)
                .setDescription("Date du planning que vous souhaitez consulter (format: DD/MM/YYYY)")
                .setRequired(false)
        ),
    execute: async (_client, interaction) => {
        const studentYear = interaction.options.getInteger(ARGS_NAME_YEAR, true);
        const configuration = Constants.CONFIGURATIONS.find( c => c.year === studentYear );
        if (!configuration) {
            return interaction.reply({ ephemeral: true, content: "Impossible de trouver la configuration de votre année d'étude." });
        }

        const dateService = DateService.getInstance();
        const interactionService = InteractionService.getInstance();

        const dateString = interaction.options.getString(ARGS_NAME_DATE);
        if (dateString) {
            const date = dateService.parse(dateString);

            await interactionService.sendTimetableMessage(interaction, date, configuration);
        } else {
            const selectOptions: SelectMenuComponentOptionData[] = dateService.generateListDaysWorked(Constants.DISCORD_MAX_NUMBER_OPTIONS_SELECT_MENU)
                .map( day => {
                    return {
                        label: dateService.formatToLocaleFr(day),
                        value: `${day.format("DD/MM/YYYY")}|${studentYear}`
                    };
                });

            await interactionService.sendReplyMessage(interaction, {
                content: "Sélectionnez le jour où vous souhaitez avoir le planning :",
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            {
                                type: ComponentType.StringSelect,
                                customId: "planning-date-select-menu",
                                placeholder: "Cliquez ici pour choisir une date...",
                                options: selectOptions
                            }
                        ]
                    }
                ],
                ephemeral: true
            }, false);
        }
    }
} satisfies SlashCommandModel;
