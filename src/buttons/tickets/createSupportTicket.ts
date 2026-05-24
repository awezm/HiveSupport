import {
    ButtonInteraction,
    ChannelType,
    PermissionFlagsBits
} from "discord.js";

import { Button } from "../../types/Button";

export default {
    customId: "ticket_support",

    async execute(interaction: ButtonInteraction) {

        const guild = interaction.guild;

        if (!guild) return;

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

        await interaction.reply({
            content: `Created ticket: ${channel}`,
            ephemeral: true
        });

        // PRIVATE STAFF THREAD
        await channel.threads.create({
            name: "staff-notes",
            autoArchiveDuration: 1440,
            type: ChannelType.PrivateThread
        });
    }
} satisfies Button;