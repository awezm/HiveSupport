import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

import { Command } from "../../types/Command";

export default {
    data: new SlashCommandBuilder()
        .setName("panel")
        .setDescription("Send the ticket panel."),

    async execute(interaction: ChatInputCommandInteraction) {

        const embed = new EmbedBuilder()
            .setTitle("🎫 BeeHive Support")
            .setDescription(
                "Choose a ticket category below."
            )
            .setColor("#E6A700");

        const row =
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("ticket_support")
                        .setLabel("General Support")
                        .setStyle(ButtonStyle.Primary),

                    new ButtonBuilder()
                        .setCustomId("ticket_billing")
                        .setLabel("IN DEV BUTTON")
                        .setStyle(ButtonStyle.Secondary)
                );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
} satisfies Command;