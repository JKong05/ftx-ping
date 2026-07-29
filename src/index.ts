import { Client } from "discord.js";
import { deployCommands } from "./deploy-commands.ts";
import { commands } from "./commands/index.ts";
import { config } from "./config.ts";
import { sql } from "./db.ts";

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

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await sql.end({ timeout: 5 });
    await client.destroy();
    process.exit(0);
  });
}

// discord logging with token
client.login(config.discordToken);
