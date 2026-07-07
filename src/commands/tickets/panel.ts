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

const ENABLE_BILLING = false;

const row = new ActionRowBuilder<ButtonBuilder>();

row.addComponents(
    new ButtonBuilder()
        .setCustomId("ticket_support")
        .setLabel("General Support")
        .setStyle(ButtonStyle.Primary)
);

if (ENABLE_BILLING) {
    row.addComponents(
        new ButtonBuilder()
            .setCustomId("ticket_billing")
            .setLabel("Billing Support")
            .setStyle(ButtonStyle.Secondary)
    );
};

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
} satisfies Command;