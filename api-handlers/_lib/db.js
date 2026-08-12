import postgres from "postgres";

// Raw SQL client backed by postgres.js — works with ANY Postgres-compatible
// database. After the Neon → Supabase migration, DATABASE_URL points at the
// Supabase transaction pooler (port 6543); the Neon HTTP driver was dropped
// because it cannot route through Supabase's pooler (SNI-based routing).
//
// The exported interface is identical to the old driver:
//   sql.unsafe(queryText, params)  → rows array (async)
//   sql.begin(tx => ...)            → transaction
// so none of the ~58 handlers that import this file needed changes.
const connectionString = process.env.DATABASE_URL;
if (!connectionString || /ep-xxxx/.test(connectionString)) {
  throw new Error(
    "DATABASE_URL is not configured. Add your Supabase PostgreSQL connection string " +
      "to the Vercel project's Environment Variables, then redeploy.",
  );
}

// Serverless-safe pool: max 1 per function instance, short idle/connect
// timeouts, and prepare:false so it works with pooled endpoints (PgBouncer /
// Supabase transaction pooler), which can't pin named prepared statements.
const sql = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export default sql;
