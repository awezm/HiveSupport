import fs from "fs";
import path from "path";

import { Collection } from "discord.js";

import { Modal } from "../types/Modal";
import { CustomClient } from "../types/Client";

export async function loadModals(client: CustomClient) {

    client.modals = new Collection<string, Modal>();

    const modalsPath = path.join(__dirname, "..", "modals");

    if (!fs.existsSync(modalsPath)) {
        console.log("Modals folder does not exist.");
        return;
    }

    const modalFolders = fs.readdirSync(modalsPath);

    for (const folder of modalFolders) {

        const folderPath = path.join(modalsPath, folder);

        if (!fs.statSync(folderPath).isDirectory()) continue;

        const modalFiles = fs
            .readdirSync(folderPath)
            .filter(file =>
                file.endsWith(".ts") ||
                file.endsWith(".js")
            );

        for (const file of modalFiles) {

            const filePath = path.join(folderPath, file);

            console.log(`Loading modal: ${file}`);

            const modal =
                (await import(filePath)).default as Modal;

            client.modals.set(
                modal.customId,
                modal
            );
        }
    }

    console.log(
        `Loaded ${client.modals.size} modals.`
    );
}