import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ModalSubmitInteraction,
    PermissionFlagsBits
} from "discord.js";

import { Modal } from "../../types/Modal";

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

            // EXISTING TICKET CHECK
            const existingChannel = guild.channels.cache.find(
                c =>
                    c.name ===
                    `ticket-${interaction.user.username.toLowerCase()}`
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

            // CREATE CHANNEL
            const channel = await guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,

                permissionOverwrites: [
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
                ]
            });

            console.log("Channel created.");

            // CLOSE BUTTON
            const closeButton = new ButtonBuilder()
                .setCustomId("closeTicket")
                .setLabel("Close Ticket")
                .setEmoji("🔒")
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