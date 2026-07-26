import { CommandInteraction, MessageFlags, SlashCommandBuilder, Team } from "discord.js";
import { deployCommands } from "../deploy-commands.js";

export const data = new SlashCommandBuilder()
  .setName("deploy")
  .setDescription("Re-register updated commands");

export async function execute(interaction: CommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({
      content: "This command only works inside a server.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const app = await interaction.client.application.fetch();
  const ownerId = app.owner instanceof Team ? app.owner.ownerId : app.owner?.id;

  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: "Only the bot owner can run this.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    await deployCommands({ guildId: interaction.guildId });
    await interaction.editReply("Commands re-registered successfully.");
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    await interaction.editReply(`Registration failed: ${message}`);
  }
}
