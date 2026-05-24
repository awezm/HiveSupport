import fs from "fs";
import path from "path";

import { Collection } from "discord.js";

import { Command } from "../types/Command";
import { CustomClient } from "../types/Client";

export async function loadCommands(client: CustomClient) {
    client.commands = new Collection<string, Command>();

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

            const commandModule = await import(filePath);

            const command: Command = commandModule.default;

            client.commands.set(command.data.name, command);
        }
    }
}