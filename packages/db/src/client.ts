import postgres from "postgres";
import { loadEnvWithOverride } from "./loadEnv.js";

// Ensure a stale/placeholder DATABASE_URL in the environment can never win
// over the real one in the root .env file (Bun's --env-file doesn't override).
loadEnvWithOverride();

/**
 * Standalone client factory for one-off scripts (backups, seeds, migrations)
 * that need their own connection outside the shared `db` instance.
 *
 * The app itself must import `db` from `@gadget-wallet/db` (src/index.ts) —
 * that is the single reusable connection. Nothing here is created at import
 * time on purpose: a module-scope `postgres(...)` call would open a second
 * pool in every serverless function that transitively imported this file,
 * doubling connection usage against Supabase's limit for no reason.
 */
const connectionString = process.env.DATABASE_URL;

// Serverless-safe pool options — see packages/db/src/index.ts for the full
// rationale. `max: 1` (per function instance) avoids exhausting Supabase's
// connection limit; `prepare: false` is required for the Supabase pooled
// (transaction-mode, port 6543) endpoint.
const poolOptions = {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
} as const;

export function createPgClient() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Supabase PostgreSQL connection string to Environment Variables.",
    );
  }

  return postgres(connectionString, poolOptions);
}
