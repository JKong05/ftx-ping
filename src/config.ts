import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID, DATABASE_URL } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DISCORD_GUILD_ID || !DATABASE_URL) {
  throw new Error("missing required environment variables");
}

export const config = {
  discordToken: DISCORD_TOKEN,
  discordClientId: DISCORD_CLIENT_ID,
  discordGuildId: DISCORD_GUILD_ID,
  databaseUrl: DATABASE_URL,
};
