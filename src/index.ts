import dotenv from "dotenv";
dotenv.config();

import {
    Client,
    GatewayIntentBits
} from "discord.js";

import { loadEvents } from "./handlers/eventHandler";
import { loadCommands } from "./handlers/commandHandler";
import { loadButtons } from "./handlers/buttonHandler";
import { loadModals } from "./handlers/modalHandler";

import { CustomClient } from "./types/Client";

function getRequiredEnv(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
}) as CustomClient;

(async () => {
    getRequiredEnv("DISCORD_TOKEN");

    await loadCommands(client);
    await loadButtons(client);
    await loadModals(client);

    await loadEvents(client);

    await client.login(process.env.DISCORD_TOKEN);
})().catch(error => {
    console.error("STARTUP ERROR:");
    console.error(error);
    process.exit(1);
});
