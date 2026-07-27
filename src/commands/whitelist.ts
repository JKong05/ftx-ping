import {
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  User,
} from "discord.js";

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

  // quick defer to avoid timeout during db interaction
  await interaction.deferReply();

  try {
    // only add/del declare a "user" option — list would throw on a required lookup
    switch (interaction.options.getSubcommand()) {
      case "add":
        await handleAdd(interaction, interaction.options.getUser("user", true));
        break;
      case "del":
        await handleRemove(interaction, interaction.options.getUser("user", true));
        break;
      case "list":
        await handleList(interaction);
        break;
    }
  } catch (e) {
    console.error("**Whitelist command failed:**", e);

    const message = e instanceof Error ? e.message : String(e);
    await interaction.editReply(`Something went wrong: ${message}`);
  }
}

async function handleAdd(interaction: ChatInputCommandInteraction, user: User) {
  // do not whitelist bots
  if (user.bot) {
    await interaction.editReply("**Bots can't be whitelisted**");
    return;
  }

  // TODO(db): look up (guildId, user.id); bail out early if the row exists.
  // const existing = await db.whitelist.find(interaction.guildId, user.id);
  // if (existing) {
  //   await interaction.editReply(`${user} is already whitelisted.`);
  //   return;
  // }

  // TODO(db): insert the row. Key on the snowflake — usernames change freely.
  // Ping metadata hangs off this record.
  // await db.whitelist.insert({
  //   guildId: interaction.guildId,
  //   userId: user.id,
  //   addedBy: interaction.user.id,
  //   addedAt: new Date(),
  // });
  await interaction.editReply(`**Added ${user}**`);
}

async function handleRemove(interaction: ChatInputCommandInteraction, user: User) {
  // TODO(db): delete the row, and report the no-op if nothing matched.
  // const removed = await db.whitelist.delete(interaction.guildId, userId);
  // if (!removed) {
  //   await interaction.editReply("That user isn't on the whitelist.");
  //   return;
  // }

  await interaction.editReply(`**Removed <@${user.id}> from the whitelist**`);
}

async function handleList(interaction: ChatInputCommandInteraction) {
  // TODO(db): fetch all rows for this guild.
  // const entries = await db.whitelist.listByGuild(interaction.guildId);
  const entries: { userId: string }[] = [];

  if (entries.length === 0) {
    await interaction.editReply("No users are whitelisted yet.");
    return;
  }

  // Message content caps at 2000 characters; page once this outgrows a screen.
  const lines = entries.map((entry) => `• <@${entry.userId}>`).join("\n");

  await interaction.editReply({
    content: `**Whitelisted users (${entries.length})**\n${lines}`,
    // Render the mentions as names without pinging everyone in the list.
    allowedMentions: { parse: [] },
  });
}
