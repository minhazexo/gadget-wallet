import { neon } from "@neondatabase/serverless";

// Guide step 2 — raw SQL client. Requires DATABASE_URL in the Vercel
// environment (see docs/gadget-wallet-vercel-update-guide.md).
//
// Fail loudly at import time with a helpful message instead of letting
// `neon(undefined)` throw a confusing parse error deep inside the driver.
const connectionString = process.env.DATABASE_URL;
if (!connectionString || /ep-xxxx/.test(connectionString)) {
  throw new Error(
    "DATABASE_URL is not configured. Add your Neon PostgreSQL connection string " +
      "to the Vercel project's Environment Variables, then redeploy.",
  );
}

const sql = neon(connectionString);

// The neon HTTP driver exposes `query(sql, params)` for conventional $1/$2
// placeholders, and `unsafe()` for embedding raw SQL inside tagged templates.
// Alias `unsafe` to the parameterized `query` form so every endpoint can keep
// using `sql.unsafe(query, params)` (the postgres.js-style shorthand).
sql.unsafe = (query, params) => sql.query(query, params);

export default sql;
