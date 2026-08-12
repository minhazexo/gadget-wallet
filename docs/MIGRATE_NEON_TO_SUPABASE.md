# Migrating the Database: Neon → Supabase ✅ COMPLETED

> **Status: DONE (2026-08-12).** All 1,045 rows across 21 tables were migrated and
> verified. The steps below are kept for reference / re-running on a fresh DB.
>
> **The one app-code change required:** `api-handlers/_lib/db.js` was swapped from
> the `@neondatabase/serverless` HTTP driver to `postgres.js` — the Neon driver
> cannot route through Supabase's pooler (SNI-based), postgres.js can. The exported
> interface (`sql.unsafe(text, params)`) is identical, so no handler changed.

Gadget Wallet's **storage and images** are already on Supabase. This guide moves the
**database** (currently Neon PostgreSQL) onto the same Supabase project so the whole
stack runs on Supabase only — with **zero app-code changes**.

## What stays the same

- **Auth**: the site uses custom JWT + bcrypt hashes stored in `users` (NOT Supabase
  Auth). The migration copies those rows verbatim, so **all users keep their
  passwords and sessions**.
- **Image URLs**: every `product_images.url` / `thumbnail_url` already points at
  `amlmxjpjuoayjzucuuee.supabase.co` — storage moves with the project, not with data.
- **API code**: the handlers speak standard Postgres SQL through
  `@neondatabase/serverless` / `postgres.js` — both drivers connect to Supabase's
  Postgres unchanged.

## What changes

| Variable | Before | After |
|---|---|---|
| `DATABASE_URL` | Neon pooled URI | Supabase **session pooler** URI (port 5432) — verified working; the transaction pooler (6543) also authenticates but had a connection-state hang in testing |
| `SUPABASE_DATABASE_URL` | — | Same Supabase URI (used by the migration scripts) |
| `api-handlers/_lib/db.js` | `@neondatabase/serverless` | `postgres.js` (same `sql.unsafe()` interface) |

## 1. Get the connection string (one-time, from you)

1. Open the Supabase dashboard for project `amlmxjpjuoayjzucuuee`.
2. **Project Settings → Database → Connection string → URI.**
3. Choose the **Transaction pooler** tab (port **6543**) — the Session pooler
   (5432) breaks serverless pooling.
4. Copy the string. It looks like:
   ```
   postgresql://postgres.amlmxjpjuoayjzucuuee:<DB-PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres
   ```
   If the password is unknown, click **Reset database password** first.

## 2. Run the migration (three commands)

```bash
# 1) Rebuild the consolidated schema (already generated — re-run if migrations change)
bun scripts/migrate-neon-to-supabase/build-schema.js

# 2) Export all tables from Neon → data/*.json   (READ-ONLY, safe)
bun scripts/migrate-neon-to-supabase/export.js

# 3) Apply schema + data to Supabase and verify row counts
bun scripts/migrate-neon-to-supabase/import.js
```

What each script does:

- `build-schema.js` — concatenates the 4 Drizzle migrations
  (`packages/db/migrations/0000…0003`) into
  `scripts/migrate-neon-to-supabase/supabase-schema.sql`. All statements are
  `IF NOT EXISTS` / `duplicate_object`-guarded, so re-runs are safe.
- `export.js` — reads every table from the live Neon DB via
  `@neondatabase/serverless` (the same driver the production API uses) and writes
  dependency-ordered JSON to `scripts/migrate-neon-to-supabase/data/`.
- `import.js` — connects to `SUPABASE_DATABASE_URL`, applies the schema, inserts
  the rows (FK checks temporarily disabled via `session_replication_role = replica`,
  re-enabled after), then **verifies every table's row count matches the source**.

> Alternative: you can also apply `supabase-schema.sql` from the Dashboard's
> **SQL Editor** if you prefer clicking — the import script does it automatically.

## 3. Point the app at Supabase

**Local** — in the root `.env`:

```env
DATABASE_URL=postgresql://postgres.amlmxjpjuoayjzucuuee:<DB-PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

Then restart the dev server and smoke-test: home page loads products, product
details gallery works, login works (existing user), cart/wishlist work.

**Production (Vercel)** — Settings → Environment Variables → update
`DATABASE_URL` to the same Supabase pooler URI, then **redeploy**. After the
CDN cache clears (~1 min), verify `https://gadgetwallet.vercel.app` end-to-end.

## 4. Post-migration checks

- [ ] `SELECT count(*) FROM products;` → **60** (matches Neon)
- [ ] `SELECT count(*) FROM product_images;` → **180**
- [ ] Storefront images still load (they live in Supabase Storage — unchanged)
- [ ] Login with an existing account (bcrypt hash copied over — still valid)
- [ ] Place a test order / add to cart / wishlist
- [ ] Admin dashboard + product editing still work

## Rollback (if anything goes wrong)

- The scripts never touch Neon — your source database is untouched.
- To revert: point `DATABASE_URL` back at the Neon pooled URI locally + in Vercel
  and redeploy. Data in Supabase can be wiped via the SQL editor
  (`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`) and re-imported.

## Optional: move to Supabase Auth (bigger change — not part of this migration)

Currently auth is custom JWT + bcrypt. Moving to Supabase Auth would require
rewriting login/register/session middleware, and every existing user would need a
password reset (Supabase hashes passwords differently). Not recommended until the
database migration is confirmed stable.
