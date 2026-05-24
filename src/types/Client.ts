import {
    Client,
    Collection
} from "discord.js";

import { Command } from "./Command";
import { Button } from "./Button";

export interface CustomClient extends Client {
    commands: Collection<string, Command>;
    buttons: Collection<string, Button>;
}