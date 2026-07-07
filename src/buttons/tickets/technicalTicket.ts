import { ButtonInteraction } from "discord.js";

import { Button } from "../../types/Button";
import { buildTicketModal, ticketCategories } from "../../config/ticketIntake";

export default {
    customId: ticketCategories.technical.buttonCustomId,

    async execute(interaction: ButtonInteraction) {
        await interaction.showModal(
            buildTicketModal(ticketCategories.technical)
        );
    }
} satisfies Button;
