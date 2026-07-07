import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ModalSubmitInteraction,
    PermissionFlagsBits
} from "discord.js";

import { Modal } from "../../types/Modal";

function getOptionalEnv(name: string): string | undefined {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
}

function sanitizeChannelSegment(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30) || "user";
}

export default {
    customId: "submitSupportTicket",

    async execute(interaction: ModalSubmitInteraction) {

        try {

            const guild = interaction.guild;

            if (!guild) return;

            // MODAL FIELDS
            const issueSummary =
                interaction.fields.getTextInputValue(
                    "issueSummary"
                );

            const troubleshooting =
                interaction.fields.getTextInputValue(
                    "troubleshooting"
                );

            const affectedService =
                interaction.fields.getTextInputValue(
                    "affectedService"
                );

            const supportRoleId = getOptionalEnv("SUPPORT_ROLE_ID");
            const ticketCategoryId = getOptionalEnv("TICKET_CATEGORY_ID");

            // EXISTING TICKET CHECK
            const existingChannel = guild.channels.cache.find(
                c =>
                    c.type === ChannelType.GuildText &&
                    c.topic === `ticket-owner:${interaction.user.id}`
            );

            if (existingChannel) {
                await interaction.reply({
                    content:
                        "You already have an open ticket.",
                    ephemeral: true
                });

                return;
            }

            console.log("Creating ticket channel...");

            const permissionOverwrites = [
                {
                    id: guild.roles.everyone.id,
                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ]
                },

                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }
            ];

            if (supportRoleId) {
                permissionOverwrites.push({
                    id: supportRoleId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageThreads
                    ]
                });
            }

            // CREATE CHANNEL
            const channel = await guild.channels.create({
                name: `ticket-${sanitizeChannelSegment(interaction.user.username)}-${interaction.user.id.slice(-4)}`,
                type: ChannelType.GuildText,
                topic: `ticket-owner:${interaction.user.id}`,
                parent: ticketCategoryId,
                permissionOverwrites
            });

            console.log("Channel created.");

            // CLOSE BUTTON
            const closeButton = new ButtonBuilder()
                .setCustomId("closeTicket")
                .setLabel("Close Ticket")
                .setStyle(ButtonStyle.Danger);

            const row =
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(closeButton);

            // SEND MESSAGE
            await channel.send({
                content:
                    `# Support Ticket\n\n` +
                    `**User:** ${interaction.user}\n` +
                    `**Issue:** ${issueSummary}\n` +
                    `**Troubleshooting:** ${troubleshooting || "None Provided"}\n` +
                    `**Affected Service:** ${affectedService}`,
                components: [row]
            });

            console.log("Ticket message sent.");

            // STAFF THREAD
            await channel.threads.create({
                name: "staff-notes",
                autoArchiveDuration: 1440,
                type: ChannelType.PrivateThread
            });

            console.log("Staff thread created.");

            // SUCCESS REPLY
            await interaction.reply({
                content: `Created ticket: ${channel}`,
                ephemeral: true
            });

        } catch (error) {
            console.error("MODAL ERROR:");
            console.error(error);

            if (!interaction.replied) {
                await interaction.reply({
                    content:
                        "Failed to create ticket.",
                    ephemeral: true
                });
            }
        }
    }
} satisfies Modal;
