import type { ChatInputCommandInteraction, SharedSlashCommand } from "discord.js";
import * as deploy from "./deploy.ts";
import * as health from "./health.ts";
import * as whitelist from "./whitelist.ts";

type Command = {
  data: SharedSlashCommand;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

/**
 * command object aggregator
 */
export const commands: Record<string, Command> = {
  deploy,
  health,
  whitelist,
};
