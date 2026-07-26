import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Missing required environment variables.");
}

export const config = {
  discordToken: DISCORD_TOKEN,
  discordClientId: DISCORD_CLIENT_ID,
};