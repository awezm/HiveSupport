import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits
} from "discord.js";

import { Command } from "../../types/Command";

function getOptionalEnv(name: string): string | undefined {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
}

export default {
    data: new SlashCommandBuilder()
        .setName("panel")
        .setDescription("Send the ticket panel."),

    async execute(interaction: ChatInputCommandInteraction) {
        const supportRoleId = getOptionalEnv("SUPPORT_ROLE_ID");
        const panelChannelId = getOptionalEnv("PANEL_CHANNEL_ID");
        const canManageGuild =
            interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ?? false;
        const canManageChannels =
            interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) ?? false;
        const hasSupportRole =
            supportRoleId !== undefined &&
            interaction.inCachedGuild() &&
            interaction.member.roles.cache.has(supportRoleId);

        if (!canManageGuild && !canManageChannels && !hasSupportRole) {
            await interaction.reply({
                content: "You do not have permission to post the ticket panel.",
                ephemeral: true
            });

            return;
        }

        if (panelChannelId && interaction.channelId !== panelChannelId) {
            await interaction.reply({
                content: `This command can only be used in <#${panelChannelId}>.`,
                ephemeral: true
            });

            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("BeeHive Support")
            .setDescription("Choose a ticket category below.")
            .setColor("#E6A700");

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ticket_support")
                    .setLabel("General Support")
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
} satisfies Command;
