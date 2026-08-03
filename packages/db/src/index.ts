import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add your Neon PostgreSQL connection string (prefer the pooled one, …-pooler… ?sslmode=require) to Vercel Environment Variables (Production + Preview).",
  );
}

// Serverless-friendly pool settings:
// - `max` bounds connections per function instance (Neon free tier ~10).
// - `idle_timeout` closes idle sockets quickly so warm Vercel lambdas don't
//   hold stale connections.
// - `connect_timeout` fails fast instead of hanging a cold start.
// For production, prefer Neon's *pooled* connection string (…-pooler… / :6543).
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export { schema };
