import { Client, Events } from "discord.js";
import { updatePresence } from "../../utils/presence";

export default {
    name: Events.ClientReady,
    once: true,

    async execute(client: Client) {
        console.log(`Logged in as ${client.user!.tag}`);

        await updatePresence(client);
    }
};