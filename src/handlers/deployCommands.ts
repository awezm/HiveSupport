import fs from "fs";
import path from "path";

import { REST, Routes } from "discord.js";

export async function deployCommands() {
    const commands = [];

    const commandsPath = path.join(__dirname, "..", "commands");

    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);

        const commandFiles = fs
            .readdirSync(folderPath)
            .filter(file =>
                file.endsWith(".ts") || file.endsWith(".js")
            );

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);

            const command = await import(filePath);

            commands.push(command.default.data.toJSON());
        }
    }

    const rest = new REST({ version: "10" }).setToken(
        process.env.DISCORD_TOKEN!
    );

    try {
        console.log("Deploying slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID!,
                process.env.GUILD_ID!
            ),
            {
                body: commands
            }
        );

        console.log("Slash commands deployed.");
    } catch (error) {
        console.error(error);
    }
}