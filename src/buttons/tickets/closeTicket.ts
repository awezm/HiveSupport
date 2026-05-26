import {
    ButtonInteraction,
    PermissionFlagsBits
} from "discord.js";

import { Button } from "../../types/Button";

export default {
    customId: "closeTicket",

    async execute(interaction: ButtonInteraction) {
        try {
            const channel = interaction.channel;

            if (!channel || !channel.isTextBased()) return;

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
                await interaction.reply({
                    content: "You do not have permission to close this ticket.",
                    ephemeral: true
                });

                return;
            }

            await interaction.reply({
                content: "🔒 Closing this ticket in 5 seconds..."
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