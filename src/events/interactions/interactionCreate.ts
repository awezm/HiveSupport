import {
    Events,
    Interaction
} from "discord.js";

import { CustomClient } from "../../types/Client";

async function replyUnavailable(interaction: Interaction, content: string) {
    if (!interaction.isRepliable()) {
        return;
    }

    const reply = {
        content,
        ephemeral: true
    };

    if (interaction.deferred || interaction.replied) {
        await interaction.followUp(reply).catch(() => null);
    } else {
        await interaction.reply(reply).catch(() => null);
    }
}

export default {
    name: Events.InteractionCreate,

    async execute(interaction: Interaction) {
        const client = interaction.client as CustomClient;

        try {
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(
                    interaction.commandName
                );

                if (!command) {
                    console.log(
                        `Missing command: ${interaction.commandName}`
                    );

                    await replyUnavailable(
                        interaction,
                        "That command is not available right now."
                    );

                    return;
                }

                await command.execute(interaction);
                return;
            }

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

                    await replyUnavailable(
                        interaction,
                        "That button is not available right now."
                    );

                    return;
                }

                await button.execute(interaction);
                return;
            }

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

                    await replyUnavailable(
                        interaction,
                        "That form is not available right now."
                    );

                    return;
                }

                await modal.execute(interaction);
                return;
            }
        } catch (error) {
            console.error("INTERACTION ERROR:");
            console.error(error);

            await replyUnavailable(
                interaction,
                "Something went wrong while handling that interaction."
            );
        }
    }
};
