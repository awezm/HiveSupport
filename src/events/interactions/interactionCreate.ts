import {
    Events,
    Interaction
} from "discord.js";

import { CustomClient } from "../../types/Client";

export default {
    name: Events.InteractionCreate,

    async execute(interaction: Interaction) {
        const client = interaction.client as CustomClient;

        // SLASH COMMANDS
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(
                interaction.commandName
            );

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
            }
        }

        // BUTTONS
        if (interaction.isButton()) {
            const button = client.buttons.get(
                interaction.customId
            );

            if (!button) return;

            try {
                await button.execute(interaction);
            } catch (error) {
                console.error(error);
            }
        }
    }
};