import {
  ClientApplication,
  CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  Team,
  TeamMemberMembershipState,
  TeamMemberRole,
} from "discord.js";
import { deployCommands } from "../deploy-commands.ts";

const DEPLOY_ROLES = new Set<TeamMemberRole>([TeamMemberRole.Admin, TeamMemberRole.Developer]);

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

  if (!canDeploy(app, interaction.user.id)) {
    await interaction.reply({
      content: "You do not have permissions to trigger deploy.",
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

function canDeploy(app: ClientApplication, userId: string): boolean {
  if (!(app.owner instanceof Team)) {
    return app.owner?.id === userId;
  }

  if (app.owner.ownerId === userId) {
    return true;
  }

  const member = app.owner.members.get(userId);
  // check if member exists in dev team + has a role that allows command deployment
  return (
    member?.membershipState === TeamMemberMembershipState.Accepted && DEPLOY_ROLES.has(member.role)
  );
}
