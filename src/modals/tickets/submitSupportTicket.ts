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
            const supportRole = supportRoleId
                ? guild.roles.cache.get(supportRoleId)
                : null;
            const ticketCategory = ticketCategoryId
                ? guild.channels.cache.get(ticketCategoryId)
                : null;

            if (supportRoleId && !supportRole) {
                await interaction.reply({
                    content: "Ticket setup error: SUPPORT_ROLE_ID does not match a role in this server.",
                    ephemeral: true
                });

                return;
            }

            if (ticketCategoryId && (!ticketCategory || ticketCategory.type !== ChannelType.GuildCategory)) {
                await interaction.reply({
                    content: "Ticket setup error: TICKET_CATEGORY_ID must point to a category in this server.",
                    ephemeral: true
                });

                return;
            }

            const existingChannel = guild.channels.cache.find(
                c =>
                    c.type === ChannelType.GuildText &&
                    c.topic === `ticket-owner:${interaction.user.id}`
            );

            if (existingChannel) {
                await interaction.reply({
                    content: "You already have an open ticket.",
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

            if (supportRole) {
                permissionOverwrites.push({
                    id: supportRole.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageThreads
                    ]
                });
            }

            const channel = await guild.channels.create({
                name: `ticket-${sanitizeChannelSegment(interaction.user.username)}-${interaction.user.id.slice(-4)}`,
                type: ChannelType.GuildText,
                topic: `ticket-owner:${interaction.user.id}`,
                parent: ticketCategory?.id,
                permissionOverwrites
            });

            console.log("Channel created.");

            const closeButton = new ButtonBuilder()
                .setCustomId("closeTicket")
                .setLabel("Close Ticket")
                .setStyle(ButtonStyle.Danger);

            const row =
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(closeButton);

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

            try {
                await channel.threads.create({
                    name: "staff-notes",
                    autoArchiveDuration: 1440,
                    type: ChannelType.PrivateThread
                });

                console.log("Staff thread created.");
            } catch (error) {
                console.error("Failed to create staff thread:");
                console.error(error);
            }

            await interaction.reply({
                content: `Created ticket: ${channel}`,
                ephemeral: true
            });
        } catch (error) {
            console.error("MODAL ERROR:");
            console.error(error);

            if (!interaction.replied) {
                await interaction.reply({
                    content: "Failed to create ticket.",
                    ephemeral: true
                });
            }
        }
    }
} satisfies Modal;
