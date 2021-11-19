import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import dayjs from "dayjs";
import type { CommandInteraction } from "discord.js";
import { DailyPlanning } from "@models/DailyPlanning";

const ARGS_NAME_DATE: string = "date";

export = {
    data: new SlashCommandBuilder()
        .setName("planning")
        .setDescription("Retourne le planning d'une date particulière.")
        .setDefaultPermission(true)
        .addStringOption(
            new SlashCommandStringOption()
                .setName(ARGS_NAME_DATE)
                .setDescription("Date du planning que vous voulez (format: DD/MM/YYYY)")
                .setRequired(false)
        ),
    execute: async (client, interaction: CommandInteraction) => {
        const dateString = interaction.options.getString(ARGS_NAME_DATE);

        // Control date validity
        const formats = ["D-M-YYYY", "DD-M-YYYY", "DD-MM-YYYY", "D-MM-YYYY", "D/M/YYYY", "DD/M/YYYY", "D/MM/YYYY", "DD/MM/YYYY"];
        const date = dayjs(dateString, formats, true);
        if (!date?.isValid()) {
            return interaction.reply({ content: "La date est invalide, merci de la saisir au format DD/MM/YYYY ( ex: 19/11/2021 ).", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        await DailyPlanning.fetchDailyPlanning(dayjs.tz(date.format("DD/MM/YYYY"), "DD/MM/YYYY", "Europe/Paris"))
            .then( async timetable => {
                return interaction.editReply({ embeds: [timetable.generateEmbed()] });
            })
            .catch(_ => {
                return interaction.editReply({
                    content: `Je n'ai pas trouvé de planning correspondant à la date saisie ( <t:${date.unix()}:D> )`
                });
            });
    }
}
