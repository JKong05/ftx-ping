import postgres from "postgres";
import { config } from "./config.ts";

// One client for the process lifetime — postgres.js pools internally, so
// creating more would just multiply connections against Supabase's limit.
export const sql = postgres(config.databaseUrl, {
  // Bot tables live in `bot`, which isn't on the default search_path.
  // Setting it here keeps queries from having to qualify every table name.
  connection: { search_path: "bot" },
  max: 10,
});

export type WhitelistEntry = {
  guild_id: string;
  user_id: string;
  added_by: string;
  added_at: Date;
};
