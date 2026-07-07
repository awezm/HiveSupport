import {
    ButtonInteraction,
    PermissionFlagsBits
} from "discord.js";

import { Button } from "../../types/Button";

const pendingClosures = new Map<string, NodeJS.Timeout>();

export default {
    customId: "closeTicket",

    async execute(interaction: ButtonInteraction) {
        try {
            const channel = interaction.channel;

            if (!channel || !channel.isTextBased()) return;

            if (!channel.isDMBased() && !channel.name.startsWith("ticket-")) {
                await interaction.reply({
                    content: "This button can only be used inside ticket channels.",
                    ephemeral: true
                });

                return;
            }

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
                await interaction.reply({
                    content: "You do not have permission to close this ticket.",
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
