import { ButtonInteraction } from "discord.js";

import { Button } from "../../types/Button";
import { buildTicketModal, ticketCategories } from "../../config/ticketIntake";

export default {
    customId: ticketCategories.account.buttonCustomId,

    async execute(interaction: ButtonInteraction) {
        await interaction.showModal(
            buildTicketModal(ticketCategories.account)
        );
    }
} satisfies Button;
