import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("health")
    .setDescription("Server health check");

export async function execute(interaction: CommandInteraction) {
    await interaction.reply("This server is healthy.");
}