import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { REST, Routes } from "discord.js";

dotenv.config();

function getRequiredEnv(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

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

    const token = getRequiredEnv("DISCORD_TOKEN");
    const clientId = getRequiredEnv("CLIENT_ID");
    const guildId = getRequiredEnv("GUILD_ID");

    const rest = new REST({ version: "10" }).setToken(token);

    try {
        console.log("Deploying slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(
                clientId,
                guildId
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

if (require.main === module) {
    void deployCommands().catch(error => {
        console.error("COMMAND DEPLOY ERROR:");
        console.error(error);
        process.exit(1);
    });
}
