import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";
import { config } from "./config.js";

const rest = new REST({ version: "10" }).setToken(config.discordToken);

type DeployCommandsProps = {
  guildId: string;
};

export async function deployCommands({ guildId }: DeployCommandsProps) {
  const commandsData = Object.values(commands).map((command) => command.data);

  console.log("Started refreshing application => " + commandsData.length + " commands.");

  await rest.put(Routes.applicationGuildCommands(config.discordClientId, guildId), {
    body: commandsData,
  });

  console.log("Successfully reloaded application => " + commandsData.length + " commands.");
}
