import { Client } from "discord.js";
import { deployCommands } from "./deploy-commands.ts";
import { commands } from "./commands/index.ts";
import { config } from "./config.ts";

const client = new Client({
  intents: ["Guilds"],
});

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

// on initial bot join
client.on("guildCreate", async (guild) => {
  try {
    await deployCommands({ guildId: guild.id });
  } catch (error) {
    console.error(`Failed to register commands for guild ${guild.id}:`, error);
  }
});

client.on("interactionCreate", async (interaction) => {
  // isChatInputCommand narrows to the subclass that actually carries `options`;
  // isCommand would also match context menu interactions, which don't.
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commands[interaction.commandName];
  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Command ${interaction.commandName} failed:`, error);
  }
});

// discord logging with token
client.login(config.discordToken);
