import {
    Events,
    Interaction
} from "discord.js";

import { CustomClient } from "../../types/Client";

export default {
    name: Events.InteractionCreate,

    async execute(interaction: Interaction) {

        const client = interaction.client as CustomClient;

        try {

            // SLASH COMMANDS
            if (interaction.isChatInputCommand()) {

                const command = client.commands.get(
                    interaction.commandName
                );

                if (!command) {
                    console.log(
                        `Missing command: ${interaction.commandName}`
                    );

                    return;
                }

                await command.execute(interaction);

                return;
            }

            // BUTTONS
            if (interaction.isButton()) {

                console.log(
                    `Button Clicked: ${interaction.customId}`
                );

                const button = client.buttons.get(
                    interaction.customId
                );

                if (!button) {

                    console.log(
                        `Missing button: ${interaction.customId}`
                    );

                    return;
                }

                await button.execute(interaction);

                return;
            }

            // MODALS
            if (interaction.isModalSubmit()) {

                console.log(
                    `Modal Submitted: ${interaction.customId}`
                );

                const modal = client.modals.get(
                    interaction.customId
                );

                if (!modal) {

                    console.log(
                        `Missing modal: ${interaction.customId}`
                    );

                    return;
                }

                await modal.execute(interaction);

                return;
            }

        } catch (error) {

            console.error(
                "INTERACTION ERROR:"
            );

            console.error(error);

            if (interaction.isRepliable()) {
                const reply = {
                    content: "Something went wrong while handling that interaction.",
                    ephemeral: true
                };

                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp(reply).catch(() => null);
                } else {
                    await interaction.reply(reply).catch(() => null);
                }
            }
        }
    }
};
