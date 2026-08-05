import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Serverless-safe pool. On Vercel each function instance gets its own module
// scope, so `max` is per-instance — keep it at 1 so concurrent invocations
// don't exhaust Neon's connection limit (use the Neon *pooled* `-pooler`
// connection string in production). `prepare: false` is REQUIRED for that
// pooled endpoint: PgBouncer transaction pooling can't keep named prepared
// statements pinned to one backend, so postgres.js's default prepared-statement
// mode throws intermittent `prepared statement "…" does not exist` errors.
// Interactive `db.transaction(...)` still works — a transaction holds a single
// backend for its whole scope.
const client: Sql = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle({
  client,
  schema,
});

export { schema };