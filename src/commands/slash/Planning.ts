import {
    ChatInputCommandInteraction,
    ComponentType,
    SelectMenuComponentOptionData
} from "discord.js";
import { SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "@discordjs/builders";
import { DateService } from "@services/DateService";
import { InteractionService } from "@services/InteractionService";
import { Constants } from "@constants";

const ARGS_NAME_DATE: string = "date";
const ARGS_NAME_YEAR: string = "année-étude";

export = {
    data: new SlashCommandBuilder()
        .setName("planning")
        .setDescription("Retourne le planning d'une date particulière.")
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName(ARGS_NAME_YEAR)
                .setDescription("Année d'étude")
                .addChoices(
                    { value: 1, name: "3IFA" },
                    { value: 2, name: "4IFA" }
                )
                .setRequired(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName(ARGS_NAME_DATE)
                .setDescription("Date du planning que vous voulez (format: DD/MM/YYYY)")
                .setRequired(false)
        ),
    execute: async (client, interaction: ChatInputCommandInteraction) => {
        const studentYear = interaction.options.get(ARGS_NAME_YEAR, true).value as number;
        const configuration = Constants.CONFIGURATIONS.find( c => c.year === studentYear );
        if (!configuration) {
            return interaction.reply({ ephemeral: true, content: "Impossible de trouver la configuration." });
        }

        const dateService = DateService.getInstance();

        const dateString = interaction.options.get(ARGS_NAME_DATE)?.value as string | undefined;
        if (dateString) {
            const date = dateService.parse(dateString);

            await InteractionService.getInstance().sendTimetableMessage(interaction, date, configuration);
        } else {
            const selectOptions: SelectMenuComponentOptionData[] = dateService.generateListDaysWorked(Constants.DISCORD_MAX_NUMBER_OPTIONS_SELECT_MENU)
                .map( day => {
                    return {
                        label: dateService.formatToLocaleFr(day),
                        value: `${day.format("DD/MM/YYYY")}|${studentYear}`
                    };
                });

            await interaction.reply({
                content: "Sélectionnez le jour où vous souhaitez avoir le planning :",
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            {
                                type: ComponentType.SelectMenu,
                                customId: "planning-date-select-menu",
                                placeholder: "Choisissez une date...",
                                options: selectOptions
                            }
                        ]
                    }
                ],
                ephemeral: true
            });
        }
    }
}
