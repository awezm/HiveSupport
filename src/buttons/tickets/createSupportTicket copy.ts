import {
    ActionRowBuilder,
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

import { Button } from "../../types/Button";

export default {
    customId: "ticket_support",

    async execute(interaction: ButtonInteraction) {

        const modal = new ModalBuilder()
            .setCustomId("submitSupportTicket")
            .setTitle("Create Support Ticket");

        // ISSUE SUMMARY
        const issueSummary = new TextInputBuilder()
            .setCustomId("issueSummary")
            .setLabel("Issue Summary")
            .setPlaceholder("Briefly describe the issue")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // TROUBLESHOOTING
        const troubleshooting = new TextInputBuilder()
            .setCustomId("troubleshooting")
            .setLabel("Troubleshooting Attempted")
            .setPlaceholder("What have you already tried?")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        // AFFECTED SERVICE
        const affectedService = new TextInputBuilder()
            .setCustomId("affectedService")
            .setLabel("Affected Service/System")
            .setPlaceholder("Ubuntu VPS, Docker, Website, Discord Bot...")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const summaryRow =
            new ActionRowBuilder<TextInputBuilder>()
                .addComponents(issueSummary);

        const troubleshootingRow =
            new ActionRowBuilder<TextInputBuilder>()
                .addComponents(troubleshooting);

        const serviceRow =
            new ActionRowBuilder<TextInputBuilder>()
                .addComponents(affectedService);

        modal.addComponents(
            summaryRow,
            troubleshootingRow,
            serviceRow
        );

        await interaction.showModal(modal);
    }
} satisfies Button;