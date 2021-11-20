import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import dayjs from "dayjs";
import type { CommandInteraction } from "discord.js";
import { DailyPlanning } from "@models/DailyPlanning";
import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from "discord.js";

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

        if (dateString) {
            // Control date validity
            const formats = ["D-M-YYYY", "DD-M-YYYY", "DD-MM-YYYY", "D-MM-YYYY", "D/M/YYYY", "DD/M/YYYY", "D/MM/YYYY", "DD/MM/YYYY"];
            const date = dayjs(dateString, formats, true);
            if (!date?.isValid()) {
                return interaction.reply({ content: "La date est invalide, merci de la saisir au format DD/MM/YYYY ( ex: 19/11/2021 ).", ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            await DailyPlanning.fetchDailyPlanning(dayjs.tz(date.format("DD/MM/YYYY"), "DD/MM/YYYY", "Europe/Paris"))
                .then( async timetable => {
                    return interaction.editReply({ embeds: [timetable.toEmbed()] });
                })
                .catch(_ => {
                    return interaction.editReply({
                        content: `Je n'ai pas trouvé de planning correspondant à la date saisie ( <t:${date.unix()}:D> )`
                    });
                });
        } else {
            let date = dayjs.tz(dayjs().format("DD/MM/YYYY"), "DD/MM/YYYY", "Europe/Paris");

            const selectOptions: MessageSelectOptionData[] = [];
            while (selectOptions.length < 25) {
                // Check that the date isn't a Saturday or Sunday
                if (date.day() !== 0 && date.day() !== 6) {
                    selectOptions.push({
                        label: date.toDate().toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                        value: `${date.format("DD/MM/YYYY")}`
                    });
                }
                // Increment the date by 1 day
                date = date.add(1, "day");
            }

            await interaction.reply({
                content: "Sélectionnez le jour où vous souhaitez avoir le planning :",
                components: [
                    new MessageActionRow()
                        .setComponents(
                            new MessageSelectMenu()
                                .setCustomId("planning-date-select-menu")
                                .setPlaceholder("Choisissez une date...")
                                .setOptions(selectOptions)
                        )
                ],
                ephemeral: true
            });
        }
    }
}
