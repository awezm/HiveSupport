import { ModalSubmitInteraction } from "discord.js";

import { ticketCategories, createTicketFromModal } from "../../config/ticketIntake";
import { Modal } from "../../types/Modal";

export default {
    customId: ticketCategories.technical.modalCustomId,

    async execute(interaction: ModalSubmitInteraction) {
        await createTicketFromModal(interaction, ticketCategories.technical);
    }
} satisfies Modal;
