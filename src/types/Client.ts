import { Collection, Client } from "discord.js";
import { Command } from "./Command";
import { Button } from "./Button";
import { Modal } from "./Modal";

export interface CustomClient extends Client {
    commands: Collection<string, Command>;
    buttons: Collection<string, Button>;
    modals: Collection<string, Modal>;
}