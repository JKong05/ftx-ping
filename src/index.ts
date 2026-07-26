import { Client } from "discord.js";
import { deployCommands } from "./deploy-commands.js";
import { commands } from "./commands/commands.js";
import { config } from "./config.js";

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
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

// discord logging with token
client.login(config.discordToken);
