import dotenv from "dotenv";
dotenv.config();

import {
    Client,
    GatewayIntentBits
} from "discord.js";

import { loadEvents } from "./handlers/eventHandler";
import { loadCommands } from "./handlers/commandHandler";
import { deployCommands } from "./handlers/deployCommands";
import { loadButtons } from "./handlers/buttonHandler";

import { CustomClient } from "./types/Client";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
}) as CustomClient;

(async () => {
    await loadCommands(client);

    await deployCommands();
    
    await loadButtons(client);

    await loadEvents(client);

    await client.login(process.env.DISCORD_TOKEN);
})();