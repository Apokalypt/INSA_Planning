import type { SlashCommandModel } from "@models/discord/SlashCommandModel";
import { SlashCommandBuilder, SlashCommandIntegerOption } from "@discordjs/builders";
import { DateService } from "@services/DateService";
import { InteractionService } from "@services/InteractionService";
import { Constants } from "@constants";

const ARGS_NAME_YEAR: string = "année-étude";

export = {
    data: new SlashCommandBuilder()
        .setName("week-planning")
        .setDescription("Affiche le screen du planning de la semaine.")
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName(ARGS_NAME_YEAR)
                .setDescription("Année d'étude")
                .addChoices(
                    { value: 3, name: "3IFA" },
                    { value: 4, name: "4IFA" }
                )
                .setRequired(true)
        ),
    execute: async (_client, interaction) => {
        const studentYear = interaction.options.getInteger(ARGS_NAME_YEAR, true);
        const configuration = Constants.CONFIGURATIONS.find( c => c.year === studentYear );
        if (!configuration) {
            return interaction.reply({ ephemeral: true, content: "Impossible de trouver la configuration de votre année d'étude." });
        }

        await InteractionService.getInstance()
            .sendWeeklyPlanningMessage(interaction, configuration, DateService.getInstance().getCurrentWeekIndex());
    }
} satisfies SlashCommandModel;
