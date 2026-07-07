import {
    ActionRowBuilder,
    ButtonInteraction,
    ChannelType,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

import { Button } from "../../types/Button";

const pendingClosures = new Map<string, NodeJS.Timeout>();

function getOptionalEnv(name: string): string | undefined {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
}

export default {
    customId: "closeTicket",

    async execute(interaction: ButtonInteraction) {
        try {
            const channel = interaction.channel;

            if (!channel || !channel.isTextBased()) return;

            if (channel.type !== ChannelType.GuildText || !channel.name.startsWith("ticket-")) {
                await interaction.reply({
                    content: "This button can only be used inside ticket channels.",
                    ephemeral: true
                });

                return;
            }

            const ticketOwnerId = channel.topic?.startsWith("ticket-owner:")
                ? channel.topic.slice("ticket-owner:".length)
                : null;

            const isTicketOwner = ticketOwnerId === interaction.user.id;
            const canManageChannels =
                interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) ?? false;
            const supportRoleId = getOptionalEnv("SUPPORT_ROLE_ID");
            const hasSupportRole =
                supportRoleId !== undefined &&
                interaction.inCachedGuild() &&
                interaction.member.roles.cache.has(supportRoleId);

            if (!isTicketOwner && !canManageChannels && !hasSupportRole) {
                await interaction.reply({
                    content: "You do not have permission to close this ticket. Only the ticket owner or staff can close it.",
                    ephemeral: true
                });

                return;
            }

            const confirmationKey = `${interaction.channelId}:${interaction.user.id}`;
            const existingConfirmation = pendingClosures.get(confirmationKey);

            if (!existingConfirmation) {
                const timeout = setTimeout(() => {
                    pendingClosures.delete(confirmationKey);
                }, 15000);

                pendingClosures.set(confirmationKey, timeout);

                await interaction.reply({
                    content: "Click **Close Ticket** again within 15 seconds to confirm.",
                    ephemeral: true
                });

                return;
            }

            clearTimeout(existingConfirmation);
            pendingClosures.delete(confirmationKey);

            const reasonInput = new TextInputBuilder()
                .setCustomId("closeReason")
                .setLabel("Close Reason")
                .setPlaceholder("Resolved, no response, duplicate, invalid, other")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(100);

            const notesInput = new TextInputBuilder()
                .setCustomId("closeNotes")
                .setLabel("Close Notes")
                .setPlaceholder("Optional notes for the archive")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setMaxLength(1000);

            const modal = new ModalBuilder()
                .setCustomId("submitCloseTicketReason")
                .setTitle("Close Ticket");

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(reasonInput),
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(notesInput)
            );

            await interaction.showModal(modal);
        } catch (error) {
            console.error("CLOSE TICKET ERROR:");
            console.error(error);

            if (!interaction.replied) {
                await interaction.reply({
                    content: "Failed to close ticket.",
                    ephemeral: true
                });
            }
        }
    }
} satisfies Button;
