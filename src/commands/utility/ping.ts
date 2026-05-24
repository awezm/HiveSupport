import {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} from "discord.js";

import { Command } from "../../types/Command";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply("Pong!");
    }
} satisfies Command;

// test