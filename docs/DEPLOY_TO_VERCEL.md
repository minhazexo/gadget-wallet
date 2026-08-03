# 🚀 Gadget Wallet — Vercel Deployment Guide

This project is deployed to Vercel as a **single monolith project**: the React
storefront (static files) and the Hono API (serverless function) live on the same
domain, so the frontend can call `/api/...` relative to its own origin — no CORS,
no separate API domain, no `VITE_API_URL` needed.

## Architecture

```
gadget-wallet/                     ← Vercel Root Directory
├── api/
│   └── [[...route]].ts            ← Vercel serverless entry (catch-all, auto-detected)
├── apps/
│   ├── web/                       ← Vite + React static build → apps/web/dist
│   └── server/
│       ├── src/
│       │   ├── app.ts             ← the whole Hono app (runtime-agnostic)
│       │   ├── index.ts           ← Bun.serve wrapper (local dev only)
│       │   └── routes/            ← auth, products, admin, …
│       └── dist/app.cjs           ← pre-bundled app (bun build --target=node, CJS)
├── packages/
│   ├── db/                        ← Drizzle + PostgreSQL schema (Neon)
│   ├── ui/                        ← shared React components
│   └── types/                     ← shared TypeScript types
├── vercel.json                    ← build + function config
└── package.json                   ← Bun workspaces root
```

**Stack:** React 18 + Vite + TailwindCSS · Hono (Bun/Node) · Drizzle ORM ·
Neon PostgreSQL (data) · Supabase Storage (images) · JWT auth.

> **Why `dist/app.cjs`?** Vercel's function builder is unreliable at bundling raw
> TypeScript from workspace packages (`@gadget-wallet/db` resolves to `.ts`
> source). The root `build` script therefore bundles the server into one
> self-contained Node-compatible file, and `api/[[...route]].ts` is a thin wrapper
> that calls `app.fetch(request)`.
>
> **Two deployment-critical details:**
> 1. The file is named `[[...route]].ts` (**with the ellipsis**) — plain `[[route]]`
>    only matches a single optional segment, so nested paths like
>    `/api/products/featured` 404 at the platform level.
> 2. The bundle is **CommonJS** (`.cjs`). Vercel compiles this handler to CJS
>    (root `package.json` has no `"type": "module"`), so it `require()`s the
>    bundle — requiring an ESM `.js` file would throw `ERR_REQUIRE_ESM` on
>    Vercel's Node 18/20 and every `/api/*` call would return 500
>    (`FUNCTION_INVOCATION_FAILED`).

---

## 📋 Prerequisites

1. **Vercel account** — [vercel.com](https://vercel.com) (free tier works)
2. **GitHub repository** — push this project to GitHub
3. **Neon** — [neon.tech](https://neon.tech) free tier — all relational data
4. **Supabase** — [supabase.com](https://supabase.com) free tier — product images
5. **Bun installed locally** for seeding — `npm install -g bun`

---

## 🗄️ Step 1 — Database (Neon PostgreSQL)

1. Create a project at [neon.tech](https://neon.tech) and copy the connection string:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
2. Apply the schema and seed **from your local machine**:
   ```bash
   export DATABASE_URL="postgresql://your-neon-connection-string-here"
   bun run db:push     # applies schema (this project's documented workflow)
   bun run db:seed     # admin user, categories, brands, 12 products, hero, banners
   ```
3. **For production on Vercel, use Neon's pooled connection string.** In the Neon
   dashboard, copy the *Pooled connection* (host ends in `-pooler`, port `5432` or
   `6543`). It multiplexes connections through PgBouncer, which matters when many
   serverless function instances open sockets at once (free tier ≈ 10 connections).

> Seed credentials: `admin@gadgetwallet.com` / `admin123`

---

## 🖼️ Step 2 — Image Storage (Supabase Storage)

The server already uploads images to Supabase in production (local disk is a dev-only
fallback). Setup is one-time:

1. Create a project at [supabase.com](https://supabase.com).
2. **Storage → New bucket** → name: `products` → enable **Public bucket**.
3. Copy from **Project Settings → API**:
   - Project URL (e.g. `https://xxxx.supabase.co`)
   - `service_role` secret (**server-only** — never expose it in the frontend)

---

## ⚙️ Step 3 — Environment Variables (Vercel)

Add these in Vercel → **Project → Settings → Environment Variables** (apply to
*Production*, *Preview*, and *Development* as needed):

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://…-pooler…?sslmode=require` | Neon **pooled** connection string |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` | Supabase service role key (uploads) |
| `JWT_SECRET` | `openssl rand -hex 32` output | JWT signing key (long random string) |
| `APP_URL` | `https://your-app.vercel.app` | CORS origin for cross-origin API calls |

**Not needed:** `VITE_API_URL` — the frontend calls relative `/api` on the same
domain. `PORT` is set by Vercel automatically. `NODE_ENV=production` is automatic.

> ⚠️ `JWT_SECRET` must be the same value across every environment, or users'
> tokens stop validating.

> 🔄 **Migrations run automatically on every deploy** (the build starts with
> `bun run db:push:vercel`), so `DATABASE_URL` must be available **during the
> build** — not just at runtime. Set it for **Production *and* Preview**, because
> preview deployments run the same build command; otherwise preview builds fail.
> One shared database for all environments is fine since `db:push` is idempotent.

---

## 🏗️ Step 4 — Vercel Project Setup

1. Push to GitHub, then **Import Project** at [vercel.com/new](https://vercel.com/new).
2. **Set the Root Directory to the repository root** — this is the most common
   deployment mistake. Vercel's monorepo detector often auto-selects a
   subdirectory like `apps/server` or `apps/web` during import.

   In **Project → Settings → General → Root Directory**, set it to the repo
   root (clear the field), and set **Framework Preset → Other**. The included
   `vercel.json` then handles the build:

   > ⚠️ **Symptoms of a wrong Root Directory:** build fails with
   > `error: Script not found "db:push:vercel"` (build runs inside
   > `apps/server` where root scripts don't exist), or the web app never builds.

   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "framework": null,
     "installCommand": "bun install",
     "buildCommand": "bun run db:push:vercel && bun run build",
     "outputDirectory": "apps/web/dist",
     "functions": {
       "api/[[...route]].ts": { "maxDuration": 30 }
     },
     "rewrites": [
       { "source": "/((?!api/).*)", "destination": "/index.html" }
     ]
   }
   ```

3. Vercel will auto-detect `bun.lock` and run `bun install` (Bun workspaces).

### What happens during a deploy

```
bun install                    # installs all workspace deps at the root
bun run db:push:vercel         # applies the current schema to DATABASE_URL
                               #   (idempotent — no-op when already in sync)
bun run build                  # 1) builds web  → apps/web/dist
                               # 2) bundles server → apps/server/dist/app.cjs
Vercel packages api/[[...route]].ts → serverless function (traces dist/app.cjs)
Static output apps/web/dist served as files; every other path rewrites to
index.html; every /api/* request hits the Hono function.
```

---

## 🧪 Step 5 — Deploy & Verify

1. First deploy will appear at `https://<project>.vercel.app`.
2. Verify the API:
   ```
   GET  https://<project>.vercel.app/api/health      → {"success":true,…}
   GET  https://<project>.vercel.app/api/products    → product list
   POST https://<project>.vercel.app/api/auth/login  → token (admin@gadgetwallet.com / admin123)
   ```
3. Verify the storefront loads and product cards show images (Supabase URLs).
4. Test **client-side routing**: open `/shop` or `/profile` directly / refresh —
   should render the app (SPA rewrite), not a 404.
5. Test an **admin upload**: log in as admin → `/admin/products/new` → create a
   product with an image. Confirm the image appears in the storefront (it lives in
   Supabase, not the serverless filesystem).

---

## 🌐 Step 6 — Custom Domain (Optional)

Vercel → **Settings → Domains** → add your domain → update DNS. Then update the
`APP_URL` env var to the new origin and redeploy. HTTPS is automatic.

---

## ⚡ Performance & Production Notes

- **Code splitting** is configured in `apps/web/vite.config.ts` — vendor libraries
  (React, Framer Motion, state, icons) are split into separately-cached chunks.
- Lazy image loading, `once: true` scroll animations, and Tailwind purging are
  already in place.
- **Vercel Web Analytics** and **Speed Insights** are enabled
  (`@vercel/analytics` + `@vercel/speed-insights` in `main.tsx`) — visitor /
  page-view counts under Vercel → **Analytics**, and real-user performance (LCP,
  CLS, INP) under Vercel → **Speed Insights** after the first production
  deployment. Both are no-ops on localhost.

---

## 🔄 Migrations on Deploy

`db:push` is the project's documented workflow (the DB was set up with
`drizzle-kit push`, so journal-based `db:migrate` will conflict).

**Automatic (default):** the `vercel.json` build command runs
`bun run db:push:vercel` (`bun run --cwd packages/db push` — no `.env` file; it
reads `DATABASE_URL` straight from the Vercel build environment) before building.
Because `drizzle-kit push` is idempotent, a deploy with an unchanged schema is a
no-op. Deliberately **no `--force` flag**: if a future schema change would drop
data, the push fails loudly instead of silently truncating.

**Notes**

- **Preview deployments also run the build.** Give them `DATABASE_URL` too, or
  scope migrations to production only:
  ```json
  "buildCommand": "if [ \"$VERCEL_ENV\" = \"production\" ]; then bun run db:push:vercel; fi && bun run build"
  ```
- **Local fallback:** for quick schema tweaks you can still run
  `bun run db:push` locally (loads `.env`) before committing.
- After editing `packages/db/src/schema.ts`, run `bun run db:generate` locally
  and commit the generated migration — `push` applies whatever the schema
  describes on the next deploy.

---

## 🐛 Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Cannot find module '@gadget-wallet/…'` during build | Ensure root `bun install` ran (Vercel uses `bun.lock`). Check Install Command isn't overridden to npm. |
| `error: Script not found "db:push:vercel"` | **Root Directory is set to a subdirectory.** Go to Project → Settings → General → Root Directory → repo root, Framework Preset → Other, then redeploy. |
| Build fails at `db:push:vercel` / `Cannot reach database` | `DATABASE_URL` is missing from the **build** environment — scope it to Production + Preview in Vercel → Settings → Environment Variables. |
| Build succeeds but `/api/*` returns 404 | The function file must be `api/[[...route]].ts` (**with ellipsis**) — plain `[[route]]` only matches one segment. Confirm it exists and `framework` in `vercel.json` is `null`. |
| `/api/health` (and other `/api/*`) return **500 `FUNCTION_INVOCATION_FAILED`** | The function can't load the server bundle: the bundle must be **CommonJS** (`dist/app.cjs`, `--format=cjs`) because the handler compiles to CJS — requiring the ESM `app.js` throws `ERR_REQUIRE_ESM` on Node 18/20. Redeploy after `bun run build`. |
| Site loads but **no products show** | The SPA rewrite `/(.*) → /index.html` is shadowing the API. Change it to `/((?!api/).*)` (excludes `/api/*`) and redeploy. Verify with `curl https://<project>.vercel.app/api/health` — it must return JSON, not HTML. |
| 404 on page refresh / direct URLs | The SPA rewrite `/(.*) → /index.html` must be present in `vercel.json`. |
| `column does not exist` (500s) | The API is running against an older schema — redeploy (the build auto-pushes) or run `bun run db:push` manually. |
| `too many connections` from Neon | Switch `DATABASE_URL` to the **pooled** connection string (`-pooler`). |
| Images fail to upload / 404 | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set? `products` bucket **public**? |
| CORS errors calling the API | Same-origin `/api` needs no CORS; if calling cross-origin, set `APP_URL` to the exact origin. |
| JWT auth fails after deploy | `JWT_SECRET` missing or different between environments. |
| Function times out | Admin image operations can exceed 10 s — `maxDuration` is already 30 s; raise it in `vercel.json` if needed. |

---

## 📚 Useful Links

- [Hono + Vercel](https://hono.dev/docs/getting-started/vercel)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vercel Monorepos](https://vercel.com/docs/monorepos)
- [Neon Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
