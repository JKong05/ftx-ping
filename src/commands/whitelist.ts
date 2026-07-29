import {
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { sql, type WhitelistEntry } from "../db.ts";

export const data = new SlashCommandBuilder()
  .setName("whitelist")
  .setDescription("Whitelisting logic")
  .setContexts(InteractionContextType.Guild)
  .addSubcommand((sub) =>
    sub
      .setName("add")
      .setDescription("Add a user to the whitelist")
      .addUserOption((option) =>
        option.setName("user").setDescription("User to whitelist").setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName("del")
      .setDescription("Delete a user from the whitelist")
      .addUserOption((option) =>
        option.setName("user").setDescription("User to delete").setRequired(true),
      ),
  )
  .addSubcommand((sub) => sub.setName("list").setDescription("List whitelisted users"));

// must use ChatInput Interaction because CommandInteraction does not have options property
export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({
      content: "You deadass thought you could use this command? LOL",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // setContexts(Guild) keeps this non-null at runtime; the guard is for the types.
  const { guildId } = interaction;
  if (!guildId) {
    await interaction.reply({
      content: "This command only works in a server.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // quick defer to avoid timeout during db interaction
  await interaction.deferReply();

  try {
    // only add/del declare a "user" option — list would throw on a required lookup
    switch (interaction.options.getSubcommand()) {
      case "add":
        await handleAdd(interaction, guildId, interaction.options.getUser("user", true));
        break;
      case "del":
        await handleRemove(interaction, guildId, interaction.options.getUser("user", true));
        break;
      case "list":
        await handleList(interaction, guildId);
        break;
    }
  } catch (e) {
    console.error("**Whitelist command failed:**", e);

    const message = e instanceof Error ? e.message : String(e);
    await interaction.editReply(`Something went wrong: ${message}`);
  }
}

async function handleAdd(interaction: ChatInputCommandInteraction, guildId: string, user: User) {
  // do not whitelist bots
  if (user.bot) {
    await interaction.editReply("**Bots can't be whitelisted**");
    return;
  }

  // The composite PK does the duplicate check for us — `do nothing` means an
  // existing row yields zero returned rows, so no separate lookup is needed.
  // Keyed on the snowflake because usernames change freely.
  const inserted = await sql`
    insert into whitelist (guild_id, user_id, added_by)
    values (${guildId}, ${user.id}, ${interaction.user.id})
    on conflict (guild_id, user_id) do nothing
    returning user_id
  `;

  if (inserted.count === 0) {
    await interaction.editReply(`<@${user.id}> is already whitelisted.`);
    return;
  }

  await interaction.editReply(`**Added <@${user.id}>**`);
}

async function handleRemove(interaction: ChatInputCommandInteraction, guildId: string, user: User) {
  const removed = await sql`
    delete from whitelist
    where guild_id = ${guildId} and user_id = ${user.id}
    returning user_id
  `;

  if (removed.count === 0) {
    await interaction.editReply("That user isn't on the whitelist.");
    return;
  }

  await interaction.editReply(`**Removed <@${user.id}> from the whitelist**`);
}

async function handleList(interaction: ChatInputCommandInteraction, guildId: string) {
  const entries = await sql<Pick<WhitelistEntry, "user_id">[]>`
    select user_id
    from whitelist
    where guild_id = ${guildId}
    order by added_at
  `;

  if (entries.length === 0) {
    await interaction.editReply("No users are whitelisted yet.");
    return;
  }

  const lines = entries.map((entry) => `• <@${entry.user_id}>`).join("\n");

  await interaction.editReply({
    content: `**Whitelisted users (${entries.length})**\n${lines}`,
    allowedMentions: { parse: [] },
  });
}
