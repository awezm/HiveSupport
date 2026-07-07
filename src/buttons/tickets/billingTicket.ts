import { ButtonInteraction } from "discord.js";

import { Button } from "../../types/Button";
import { buildTicketModal, ticketCategories } from "../../config/ticketIntake";

export default {
    customId: ticketCategories.billing.buttonCustomId,

    async execute(interaction: ButtonInteraction) {
        await interaction.showModal(
            buildTicketModal(ticketCategories.billing)
        );
    }
} satisfies Button;
