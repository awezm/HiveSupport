import { ModalSubmitInteraction } from "discord.js";

import { ticketCategories, createTicketFromModal } from "../../config/ticketIntake";
import { Modal } from "../../types/Modal";

export default {
    customId: ticketCategories.billing.modalCustomId,

    async execute(interaction: ModalSubmitInteraction) {
        await createTicketFromModal(interaction, ticketCategories.billing);
    }
} satisfies Modal;
