import {
    AttachmentBuilder,
    ButtonInteraction,
    ChannelType,
    PermissionFlagsBits,
    TextChannel
} from "discord.js";

import { Button } from "../../types/Button";

const pendingClosures = new Map<string, NodeJS.Timeout>();

function getOptionalEnv(name: string): string | undefined {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
}

async function fetchAllMessages(channel: TextChannel) {
    const messages = [];
    let before: string | undefined;

    while (true) {
        const batch = await channel.messages.fetch({
            limit: 100,
            before
        });

        if (batch.size === 0) {
            break;
        }

        messages.push(...batch.values());
        before = batch.last()?.id;
    }

    return messages.reverse();
}

function formatTranscriptLine(channel: TextChannel, closedBy: string) {
    return [
        `Ticket Transcript`,
        `Channel: #${channel.name}`,
        `Channel ID: ${channel.id}`,
        `Closed By: ${closedBy}`,
        `Closed At: ${new Date().toISOString()}`,
        `Topic: ${channel.topic ?? "None"}`,
        ``
    ].join("\n");
}

async function buildTranscriptBuffer(channel: TextChannel, closedBy: string) {
    const messages = await fetchAllMessages(channel);
    const lines = [formatTranscriptLine(channel, closedBy)];

    for (const message of messages) {
        const createdAt = message.createdAt.toISOString();
        const attachments = message.attachments.map(attachment => attachment.url);
        const contentParts = [message.content.trim(), ...attachments].filter(Boolean);
        const content = contentParts.join(" | ") || "[no text content]";

        lines.push(
            `[${createdAt}] ${message.author.tag}: ${content}`
        );
    }

    return Buffer.from(lines.join("\n"), "utf8");
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

            const transcriptChannelId = getOptionalEnv("TRANSCRIPT_CHANNEL_ID");

            if (!transcriptChannelId) {
                await interaction.reply({
                    content: "Transcript archive is not configured. Set TRANSCRIPT_CHANNEL_ID before closing tickets.",
                    ephemeral: true
                });

                return;
            }

            const transcriptChannel = interaction.guild?.channels.cache.get(transcriptChannelId);

            if (!transcriptChannel || transcriptChannel.type !== ChannelType.GuildText) {
                await interaction.reply({
                    content: "Transcript archive channel is invalid. Update TRANSCRIPT_CHANNEL_ID before closing tickets.",
                    ephemeral: true
                });

                return;
            }

            await interaction.reply({
                content: "Archiving transcript and closing this ticket...",
                ephemeral: true
            });

            try {
                const textChannel = channel as TextChannel;
                const transcriptBuffer = await buildTranscriptBuffer(
                    textChannel,
                    `${interaction.user.tag} (${interaction.user.id})`
                );
                const transcriptFile = new AttachmentBuilder(transcriptBuffer, {
                    name: `${textChannel.name}-transcript.txt`
                });

                await transcriptChannel.send({
                    content:
                        `Archived transcript from <#${textChannel.id}>.\n` +
                        `Ticket owner: ${ticketOwnerId ? `<@${ticketOwnerId}>` : "Unknown"}\n` +
                        `Closed by: ${interaction.user}`,
                    files: [transcriptFile]
                });
            } catch (error) {
                console.error("Failed to archive transcript:");
                console.error(error);

                await interaction.followUp({
                    content: "Failed to archive the transcript, so the ticket was not deleted.",
                    ephemeral: true
                });

                return;
            }

            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    console.error("Failed to delete ticket channel:");
                    console.error(error);
                }
            }, 3000);
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
