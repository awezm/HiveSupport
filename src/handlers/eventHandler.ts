import fs from "fs";
import path from "path";
import { Client } from "discord.js";

export async function loadEvents(client: Client) {
    const eventsPath = path.join(__dirname, "..", "events");

    const eventFolders = fs.readdirSync(eventsPath);

    for (const folder of eventFolders) {
        const folderPath = path.join(eventsPath, folder);

        const eventFiles = fs
            .readdirSync(folderPath)
            .filter(file => file.endsWith(".ts") || file.endsWith(".js"));

        for (const file of eventFiles) {
            const filePath = path.join(folderPath, file);

            const event = await import(filePath);

            if (event.default.once) {
                client.once(event.default.name, (...args) =>
                    event.default.execute(...args)
                );
            } else {
                client.on(event.default.name, (...args) =>
                    event.default.execute(...args)
                );
            }
        }
    }
}