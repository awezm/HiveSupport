import {
    AttachmentBuilder,
    ChannelType,
    EmbedBuilder,
    ModalSubmitInteraction,
    PermissionFlagsBits,
    TextChannel
} from "discord.js";

import { getTicketCategoryByChannelCode } from "../../config/ticketIntake";
import { Modal } from "../../types/Modal";

function getOptionalEnv(name: string): string | undefined {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
}

function getTicketOwnerId(channel: TextChannel): string | null {
    return channel.topic?.startsWith("ticket-owner:")
        ? channel.topic.slice("ticket-owner:".length)
        : null;
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

function formatTranscriptHeader(
    channel: TextChannel,
    closedBy: string,
    closeReason: string,
    closeNotes: string
) {
    return [
        "Ticket Transcript",
        `Channel: #${channel.name}`,
        `Channel ID: ${channel.id}`,
        `Closed By: ${closedBy}`,
        `Closed At: ${new Date().toISOString()}`,
        `Close Reason: ${closeReason}`,
        `Close Notes: ${closeNotes || "None"}`,
        `Topic: ${channel.topic ?? "None"}`,
        ""
    ].join("\n");
}

async function buildTranscriptBuffer(
    channel: TextChannel,
    closedBy: string,
    closeReason: string,
    closeNotes: string
) {
    const messages = await fetchAllMessages(channel);
    const lines = [
        formatTranscriptHeader(
            channel,
            closedBy,
            closeReason,
            closeNotes
        )
    ];

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

function getChannelCode(channelName: string): string | null {
    const parts = channelName.split("-");
    return parts.length >= 3 ? parts[1] : null;
}

export default {
    customId: "submitCloseTicketReason",

    async execute(interaction: ModalSubmitInteraction) {
        try {
            const channel = interaction.channel;

            if (!channel || channel.type !== ChannelType.GuildText || !channel.name.startsWith("ticket-")) {
                await interaction.reply({
                    content: "This form can only be submitted inside ticket channels.",
                    ephemeral: true
                });

                return;
            }

            const ticketOwnerId = getTicketOwnerId(channel);
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
                    content: "You do not have permission to close this ticket.",
                    ephemeral: true
                });

                return;
            }

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

            const closeReason = interaction.fields.getTextInputValue("closeReason").trim();
            const closeNotes = interaction.fields.getTextInputValue("closeNotes").trim();
            const channelCode = getChannelCode(channel.name);
            const ticketCategory = channelCode
                ? getTicketCategoryByChannelCode(channelCode)
                : undefined;

            await interaction.reply({
                content: "Archiving transcript and closing this ticket...",
                ephemeral: true
            });

            try {
                const transcriptBuffer = await buildTranscriptBuffer(
                    channel,
                    `${interaction.user.tag} (${interaction.user.id})`,
                    closeReason,
                    closeNotes
                );
                const transcriptFile = new AttachmentBuilder(transcriptBuffer, {
                    name: `${channel.name}-transcript.txt`
                });
                const archiveEmbed = new EmbedBuilder()
                    .setTitle("Ticket Archived")
                    .setColor(ticketCategory?.embedColor ?? "#E6A700")
                    .addFields(
                        {
                            name: "Ticket Channel",
                            value: `#${channel.name}`,
                            inline: true
                        },
                        {
                            name: "Ticket Type",
                            value: ticketCategory?.buttonLabel ?? "Unknown",
                            inline: true
                        },
                        {
                            name: "Ticket Owner",
                            value: ticketOwnerId ? `<@${ticketOwnerId}>` : "Unknown",
                            inline: true
                        },
                        {
                            name: "Closed By",
                            value: `${interaction.user}`,
                            inline: true
                        },
                        {
                            name: "Close Reason",
                            value: closeReason,
                            inline: true
                        },
                        {
                            name: "Channel ID",
                            value: channel.id,
                            inline: true
                        },
                        {
                            name: "Close Notes",
                            value: closeNotes || "None provided."
                        }
                    )
                    .setFooter({
                        text: "Transcript attached as a file"
                    })
                    .setTimestamp();

                await transcriptChannel.send({
                    embeds: [archiveEmbed],
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
            console.error("CLOSE TICKET MODAL ERROR:");
            console.error(error);

            if (!interaction.replied) {
                await interaction.reply({
                    content: "Failed to close ticket.",
                    ephemeral: true
                });
            }
        }
    }
} satisfies Modal;
