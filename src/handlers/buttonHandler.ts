import fs from "fs";
import path from "path";

import { Collection } from "discord.js";

import { Button } from "../types/Button";
import { CustomClient } from "../types/Client";

export async function loadButtons(client: CustomClient) {
    client.buttons = new Collection<string, Button>();

    const buttonsPath = path.join(__dirname, "..", "buttons");

    const buttonFolders = fs.readdirSync(buttonsPath);

    for (const folder of buttonFolders) {
        const folderPath = path.join(buttonsPath, folder);

        const buttonFiles = fs
            .readdirSync(folderPath)
            .filter(file =>
                file.endsWith(".ts") || file.endsWith(".js")
            );

        for (const file of buttonFiles) {
            const filePath = path.join(folderPath, file);

            const buttonModule = await import(filePath);

            const button: Button = buttonModule.default;

            client.buttons.set(button.customId, button);
        }
    }
}