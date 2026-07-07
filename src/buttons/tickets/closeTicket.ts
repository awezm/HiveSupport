import {
    ButtonInteraction,
    ChannelType,
    PermissionFlagsBits
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

            await interaction.reply({
                content: "Closing this ticket in 5 seconds..."
            });

            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    console.error("Failed to delete ticket channel:");
                    console.error(error);
                }
            }, 5000);
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
