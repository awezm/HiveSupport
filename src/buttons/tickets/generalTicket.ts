import { ButtonInteraction } from "discord.js";

import { Button } from "../../types/Button";
import { buildTicketModal, ticketCategories } from "../../config/ticketIntake";

export default {
    customId: ticketCategories.general.buttonCustomId,

    async execute(interaction: ButtonInteraction) {
        await interaction.showModal(
            buildTicketModal(ticketCategories.general)
        );
    }
} satisfies Button;
