import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema.js";
import { loadEnvWithOverride } from "./loadEnv.js";

// Ensure a stale/placeholder DATABASE_URL in the environment can never win
// over the real one in the root .env file (Bun's --env-file doesn't override).
loadEnvWithOverride();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client: Sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle({
  client,
  schema,
});

export { schema };