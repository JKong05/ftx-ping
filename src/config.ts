import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.example`);
  }
  return value;
}

export const config = {
  token: required("DISCORD_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  /** When set, slash commands register to this guild only (instant, good for dev). */
  guildId: process.env.DISCORD_GUILD_ID || undefined,
  dataFile: process.env.DATA_FILE || "./data/subscriptions.json",
} as const;
