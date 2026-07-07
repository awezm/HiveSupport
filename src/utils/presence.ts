import { ActivityType, Client } from "discord.js";

import {
    PresenceActivityConfig,
    PresenceActivityType,
    presenceConfig
} from "../config/presence";

const activityTypeMap: Record<PresenceActivityType, ActivityType> = {
    custom: ActivityType.Custom,
    playing: ActivityType.Playing,
    watching: ActivityType.Watching,
    listening: ActivityType.Listening,
    competing: ActivityType.Competing
};

function buildActivity(activity: PresenceActivityConfig) {
    const type = activityTypeMap[activity.type];

    if (type === ActivityType.Custom) {
        return {
            type,
            name: "custom",
            state: activity.state ?? activity.text ?? "Handling support tickets"
        };
    }

    return {
        type,
        name: activity.text ?? "support tickets"
    };
}

export async function updatePresence(client: Client) {
    const activities = presenceConfig.activities.map(buildActivity);

    if (activities.length === 0) {
        return;
    }

    let index = 0;

    const setActivity = () => {
        client.user?.setPresence({
            activities: [activities[index]],
            status: presenceConfig.status
        });

        index = (index + 1) % activities.length;
    };

    setActivity();

    if (activities.length > 1 && presenceConfig.rotationIntervalMs > 0) {
        setInterval(setActivity, presenceConfig.rotationIntervalMs);
    }
}
