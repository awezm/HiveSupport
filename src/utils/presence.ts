import { ActivityType, Client } from "discord.js";

const activities = [
    {
        name: "HiveSupport Beta",
        state: "🚧 Alpha Prototype",
        type: ActivityType.Custom,
    },
    {
        name: "HiveSupport <3",
        type: ActivityType.Watching,
    },
    {
        name: "Managing Tickets",
        type: ActivityType.Playing,
    },
    {
        name: "New Backend!!",
        type: ActivityType.Competing,
    },
];

export async function updatePresence(client: Client) {
    let index = 0;

    const setActivity = () => {
        client.user?.setPresence({
            activities: [activities[index]],
            status: "idle",
        });

        index = (index + 1) % activities.length;
    };

    // Set first activity immediately
    setActivity();

    // Rotate every 15 seconds
    setInterval(setActivity, 15000);
}
