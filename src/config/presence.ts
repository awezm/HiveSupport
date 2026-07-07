export type PresenceActivityType =
    | "custom"
    | "playing"
    | "watching"
    | "listening"
    | "competing";

export interface PresenceActivityConfig {
    type: PresenceActivityType;
    text?: string;
    state?: string;
}

export const presenceConfig = {
    status: "online" as const,
    rotationIntervalMs: 15000,
    activities: [
        {
            type: "custom",
            state: "Handling support tickets"
        },
        {
            type: "watching",
            text: "Bee update me live!"
        },
        {
            type: "listening",
            text: "ticket updates"
        }
    ] satisfies PresenceActivityConfig[]
};
