# 🚀 Gadget Wallet — Vercel Deployment Guide

This project deploys to Vercel as a **single monolith project**: the React
storefront (static files) and the API (plain Node.js serverless functions) live
on the same domain, so the frontend calls `/api/...` relative to its own
origin — no CORS, no separate API domain, no `VITE_API_URL` needed.

> 📖 This guide reflects the **guide-style layout** introduced by
> `docs/gadget-wallet-vercel-update-guide.md`: the frontend lives in `client/`,
> and the API is a set of small, dependency-light functions under `api/` that
> query Neon directly with raw SQL. The old Hono app under `apps/server` is
> kept **for local development only** — it is not deployed.

## Architecture

```
gadget-wallet/                     ← Vercel Root Directory
├── api/                           ← Vercel serverless functions (auto-detected)
│   └── [...route].js              ← THE single catch-all function. Every /api/*
│                                     request lands here; it matches the path
│                                     against the route table and dispatches to
│                                     the right handler in api-handlers/.
├── api-handlers/                  ← All 54 route handlers. Kept OUTSIDE api/
│   ├── _lib/                      ←   on purpose so Vercel deploys exactly
│   │   ├── db.js                  ←   ONE function (the catch-all) — well under
│   │   ├── supabase.js            ←   the Hobby plan's 12-function limit.
│   │   ├── auth.js                ←
│   │   ├── respond.js             ←
│   │   ├── products.js            ←
│   │   ├── multipart.js           ←
│   │   └── users.js / orders.js   ←
│   ├── _routes.js                 ← path→handler route table (all 54 routes,
│   ├── products/                  ←   most-specific-first ordering)
│   ├── categories/                ←
│   ├── brands/                    ←
│   ├── auth/                      ←
│   ├── profile/                   ←
│   ├── admin/                     ←
│   ├── cart/ · wishlist/ · orders/ · reviews/ · address/ · payment-methods/
│   │   notifications/ · recently-viewed/ · health.js
├── client/                        ← Vite + React static build → client/dist
│   └── src/
│       ├── pages/                 ← storefront + admin pages
│       └── store/                 ← Zustand stores (auth, cart, wishlist, toast)
├── apps/
│   └── server/                    ← FULL Hono API — LOCAL DEV ONLY, not deployed
├── packages/
│   ├── db/                        ← Drizzle schema + migrations + seed (Neon)
│   ├── ui/                        ← shared React components
│   └── types/                     ← shared TypeScript types
├── vercel.json                    ← build + SPA rewrite config
└── package.json                   ← Bun workspaces root
```

**Stack:** React 18 + Vite + TailwindCSS · Plain Node.js serverless functions
(`@neondatabase/serverless`, `@supabase/supabase-js`, `jsonwebtoken`,
`bcryptjs`, `busboy`) · Neon PostgreSQL (data) · Supabase Storage (images) ·
JWT auth.

> **Why exactly one function?** Vercel's Hobby plan caps a deployment at **12
> serverless functions**. The full API has 54 routes, so deploying each as its
> own file would exceed that cap and the build fails with *"Serverless Function
> size / Function count limit"*. Instead the repo ships a **single catch-all
> function** — `api/[...route].js` — that parses the URL and dispatches to the
> matching handler under `api-handlers/` (kept outside `api/` so it isn't
> deployed as separate functions). Handlers were written for Vercel's filesystem
> routing, so the dispatcher reproduces that contract: it merges path params and
> query params into `req.query` (`[id].js` → `req.query.id`) and parses JSON
> bodies into `req.body`.
>
> **The API is native ESM.** The root `package.json` declares `"type": "module"`,
> so Vercel runs the dispatcher as ESM directly — no ESM→CommonJS compile step
> (that also silences the *"Node.js functions are compiled from ESM to CommonJS"*
> build warning). Only the **frontend** needs a build step.

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
   dashboard, copy the *Pooled connection* (host ends in `-pooler`). It multiplexes
   connections through PgBouncer, which matters when many serverless function
   instances open sockets at once (free tier ≈ 10 connections).

> Seed credentials: `admin@gadgetwallet.com` / `admin123` (a `users`-table admin,
> logs in via `POST /api/auth/login`).

---

## 🖼️ Step 2 — Image Storage (Supabase Storage)

Product images upload to Supabase Storage in production. Setup is one-time:

1. Create a project at [supabase.com](https://supabase.com).
2. **Storage → New bucket** → name: `products` → enable **Public bucket**.
3. Copy from **Project Settings → API**:
   - Project URL (e.g. `https://xxxx.supabase.co`)
   - `service_role` secret (**server-only** — never expose it in the frontend)

Images are stored at `products/{productId}/{file}` inside the bucket; the public
URL is saved in the `product_images.url` column and mirrored to
`products.thumbnail_url`.

---

## ⚙️ Step 3 — Environment Variables (Vercel)

Add these in Vercel → **Project → Settings → Environment Variables** (apply to
*Production*, *Preview*, and *Development* as needed):

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://…-pooler…?sslmode=require` | Neon **pooled** connection string (required) |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase project URL (required for image uploads) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` | Supabase service role key (uploads) |
| `JWT_SECRET` | `openssl rand -hex 32` output | JWT signing key — **required in production** |
| `ADMIN_EMAIL` | `admin@example.com` | *Optional* — guide-style admin login (`POST /api/admin/login`) |
| `ADMIN_PASSWORD` | `strongpassword` | *Optional* — guide-style admin login password |
| `APP_URL` | `https://your-app.vercel.app` | Optional — CORS origin for cross-origin API calls only |

> ℹ️ **`ADMIN_EMAIL` / `ADMIN_PASSWORD` are optional.** The app's own admin panel
> signs in through `POST /api/auth/login` with a `users`-table account whose
> `role = 'admin'` (seeded: `admin@gadgetwallet.com` / `admin123`). The env-var
> pair only powers the alternative, guide-style `POST /api/admin/login` and can
> be left unset.

**Not needed:** `VITE_API_URL` — the frontend calls relative `/api` on the same
domain. `PORT` is set by Vercel automatically. `NODE_ENV=production` is automatic.

> ⚠️ **`JWT_SECRET` is enforced in production.** If it is missing or left at the
> `.env.example` placeholder (`your-…`), the API fails loudly instead of silently
> signing tokens with a public default secret. Set a real value (e.g. the output
> of `openssl rand -hex 32`) and keep it identical across every environment or
> issued tokens stop validating.

> 💡 **Two admin sign-in paths** (both produce a JWT with `role: "admin"`):
> 1. **Guide-style (env vars):** `POST /api/admin/login` with
>    `{ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }`.
> 2. **Users-table admin (default app flow):** `POST /api/auth/login` with the
>    seeded admin credentials (`admin@gadgetwallet.com` / `admin123`), or any
>    account whose `users.role = 'admin'`. The admin panel itself uses this flow.

> 🔄 **Migrations are applied manually** (not during the Vercel build), so the
> build never fails on transient DB connectivity. After a schema change, run
> `bun run db:push:vercel` against the production `DATABASE_URL` (see
> [Migrations on Deploy](#-migrations-on-deploy)).

---

## 🏗️ Step 4 — Vercel Project Setup

1. Push to GitHub, then **Import Project** at [vercel.com/new](https://vercel.com/new).
2. **Set the Root Directory to the repository root** — this is the most common
   deployment mistake. Vercel's monorepo detector often auto-selects a
   subdirectory like `client` or `apps/server` during import.

   In **Project → Settings → General → Root Directory**, set it to the repo
   root (clear the field), and set **Framework Preset → Other**. The included
   `vercel.json` then handles the build:

   > ⚠️ **Symptoms of a wrong Root Directory:** build fails with
   > `error: Script not found "build"` or `db:push:vercel` (the build runs
   > inside a subdirectory where root scripts don't exist), or the web app
   > never builds.

   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "framework": null,
     "installCommand": "bun install",
     "buildCommand": "bun run build",
     "outputDirectory": "client/dist",
     "rewrites": [
       { "source": "/((?!api/).*)", "destination": "/index.html" }
     ]
   }
   ```

3. Vercel will auto-detect `bun.lock` and run `bun install` (Bun workspaces).

### What happens during a deploy

```
bun install                       # installs all workspace deps at the root
bun run build                     # builds the frontend → client/dist
                                  #   (bun run --cwd client build → tsc -b && vite build)
api/[...route].js auto-detected  # ONE Node serverless function (the catch-all)
api-handlers/ is NOT deployed     # 54 route handlers, imported by the dispatcher
Static output client/dist served  # every non-/api path rewrites to index.html (SPA)
/api/* requests hit the function  # dispatcher routes them to the right handler
```

> **Optional — longer timeouts.** Default serverless function duration on the
> Hobby plan is 10 s, which can be tight for multi-image uploads. Add a
> `functions` block to `vercel.json` to raise it for the catch-all:
> ```json
> "functions": {
>   "api/[...route].js": { "maxDuration": 30 }
> }
> ```

---

## 🧪 Step 5 — Deploy & Verify

1. First deploy will appear at `https://<project>.vercel.app`.
2. Verify the API:
   ```
   GET  https://<project>.vercel.app/api/health                → { success: true }
   GET  https://<project>.vercel.app/api/products              → { success, data, total, ... }
   GET  https://<project>.vercel.app/api/products/new-arrivals → { success, data }
   GET  https://<project>.vercel.app/api/products/<slug>       → { success, data: { ...images, specs } }
   GET  https://<project>.vercel.app/api/categories            → { success, data }
   GET  https://<project>.vercel.app/api/brands                → { success, data }
   POST https://<project>.vercel.app/api/auth/login            → { success, data: { user, token } }
   POST https://<project>.vercel.app/api/admin/login           → { success, data: { token } }  (ADMIN_EMAIL/ADMIN_PASSWORD)
   ```
   Every endpoint returns JSON with `success: true/false` — **never** HTML. There is
   also an offline smoke suite that exercises **36 checks across the whole API**
   (products, auth, profile, cart, wishlist, orders, reviews, admin, and more):
   ```bash
   bun run --env-file=.env scripts/smoke-api.mjs   # → 36/36 checks passed
   ```
3. Verify the storefront loads and product cards show images (Supabase URLs).
4. Test **client-side routing**: open `/shop` or `/profile` directly / refresh —
   should render the app (SPA rewrite), not a 404.
5. Test an **admin upload**: log in as admin → `/admin/products/new` → create a
   product with an image. Confirm the image appears in the storefront (it lives
   in Supabase, not the serverless filesystem).

---

## 🌐 Step 6 — Custom Domain (Optional)

Vercel → **Settings → Domains** → add your domain → update DNS. Then update the
`APP_URL` env var to the new origin and redeploy. HTTPS is automatic.

---

## 🖥️ Local Development (before deploying)

Run the full stack locally with Bun (web + API in parallel):

```bash
bun install        # one-time
bun run dev        # → Vite web app on http://localhost:5183, API on :3000
```

The root `package.json` runs `dev:web` (`client`) and `dev:server` (`apps/server`)
in parallel; `client/vite.config.ts` proxies `/api` → `http://localhost:3000`.
The **local** API is the full Hono app under `apps/server` — it mirrors the
`api/` functions' routes for development. `bun run build` produces the exact
`client/dist` output Vercel serves.

---

## 📡 API Reference (what `api/` implements)

All responses use the shape `{ success: boolean, data?, message? }`; the
products list additionally returns `{ total, page, limit, totalPages }`.

| Method & path | Auth | Notes |
|---|---|---|
| `GET /api/health` | — | Uptime/liveness probe → `{ success: true }` |
| `GET /api/products` | — | Paginated (`page`, `limit`); filters `category`, `brand` (slug or id), `search`, `sale` |
| `GET /api/products/featured` | — | Homepage hero grid (max 8) |
| `GET /api/products/new-arrivals` | — | New arrivals (max 12) |
| `GET /api/products/:slug-or-id` · `/api/products/by-id/:id` | — | Detail incl. `images` + `specs` |
| `GET /api/categories` · `/api/categories/:slug` | — | With live product counts |
| `GET /api/brands` · `/api/brands/:slug` | — | |
| `POST /api/auth/register` | — | `{ email, name, password }` |
| `POST /api/auth/login` | — | `{ email, password }` → `{ user, token }` |
| `GET /api/auth/me` | Bearer | Re-checks the user against the DB |
| `POST /api/auth/logout-all` | Bearer | Bumps `token_version` |
| `GET /api/profile` · `PUT /api/profile` | Bearer | Get/update `name`, `phone`, `avatar` |
| `PUT /api/profile/password` | Bearer | `{ currentPassword, newPassword }` |
| `PUT /api/profile/two-factor` | Bearer | `{ enabled }` |
| `POST /api/admin/login` | — | Env-based (ADMIN_EMAIL/ADMIN_PASSWORD), *optional* |
| `GET /api/admin/dashboard` | Admin | Stat cards |
| `GET /api/admin/orders` | Admin | Latest 20 orders |
| `GET /api/admin/products` · `POST /api/admin/products` | Admin | Create accepts **multipart/form-data** (fields + image files) **or** JSON; fields: `name, slug, shortDescription, fullDescription, price, sku, brandId, categoryId` (+ optional `stock, discountPrice, isFeatured, isNewArrival, isBestSeller, thumbnailUrl`/`image_url`) |
| `GET /api/admin/products/:id` · `PATCH` · `DELETE` | Admin | PATCH is a partial update; DELETE soft-deletes + removes Supabase images |
| `POST /api/admin/products/:id/images` | Admin | Multipart upload (max 12 images/product, JPG/PNG/WEBP ≤ 5 MB) |
| `PATCH /api/admin/products/:id/images/reorder` | Admin | `{ imageIds: [...] }` |
| `PATCH /api/admin/products/:id/images/:imageId` · `DELETE` | Admin | Update alt / set primary / delete |
| `POST /api/cart/add` | —* | `{ productId, quantity, userId?|sessionId? }` |
| `PATCH /api/cart/update` | —* | `{ productId, quantity, userId?|sessionId? }` |
| `DELETE /api/cart/remove` | —* | `{ productId, userId?|sessionId? }` |
| `POST /api/cart/merge` | —* | Merge guest cart on login `{ sessionId, userId }` |
| `GET /api/cart/:sessionId` · `/api/cart/user/:userId` · `/api/cart/summary/:userId` | —* | Read cart for guest / user |
| `GET /api/wishlist` | Bearer | Current user's wishlist (JWT) |
| `POST /api/wishlist/add` | Bearer | `{ productId }` |
| `DELETE /api/wishlist/remove` | Bearer | `{ productId }` |
| `POST /api/wishlist/move-to-cart` | Bearer | `{ productId }` |
| `GET /api/orders` · `POST /api/orders` | Bearer | List / create order |
| `GET /api/orders/:id` | Bearer | Current user's order (enriched) |
| `POST /api/orders/:id/cancel` | Bearer | Cancel order |
| `POST /api/orders/:id/return` | Bearer | Request return |
| `GET /api/orders/user/:userId` | Bearer | Per-user order history |
| `POST /api/reviews` | Bearer | `{ productId, rating, title, comment }` |
| `PUT /api/reviews/:id` · `DELETE /api/reviews/:id` | Bearer | Update / delete own review |
| `GET /api/reviews/user` | Bearer | Current user's reviews |
| `GET /api/address` · `POST /api/address` | Bearer | List / create address |
| `PUT /api/address/:id` · `DELETE /api/address/:id` | Bearer | Update / delete address |
| `POST /api/address/:id/default` | Bearer | Set default address |
| `GET /api/payment-methods` · `POST /api/payment-methods` | Bearer | List / create payment method |
| `DELETE /api/payment-methods/:id` | Bearer | Delete payment method |
| `POST /api/payment-methods/:id/default` | Bearer | Set default payment method |
| `GET /api/notifications` | Bearer | Current user's notifications |
| `GET /api/notifications/preferences` · `PUT` | Bearer | Read / update notification preferences |
| `POST /api/notifications/read-all` | Bearer | Mark all as read |
| `GET /api/recently-viewed` · `POST /api/recently-viewed` | Bearer | List / record recently viewed |

Admin access = a Bearer JWT whose payload `role` is `"admin"`, obtainable from
either `POST /api/admin/login` or `POST /api/auth/login` with a users-table admin.

> \* Cart endpoints work for **guests or signed-in users** — pass `sessionId`
> (guest cart) or `userId` (user cart). Everything else marked **Bearer** needs
> a `Authorization: Bearer <token>` header.

> ✅ **No known limitations — the full API is deployed.** Cart, wishlist,
> orders, reviews, addresses, payment methods, notifications, recently-viewed,
> and health are all implemented as `api/` functions and included in the 36-check
> smoke suite (`scripts/smoke-api.mjs`). The local Hono app under `apps/server`
> remains for development only; nothing the storefront calls 404s on Vercel.

---

## ⚡ Performance & Production Notes

- **Code splitting** is configured in `client/vite.config.ts` — vendor libraries
  (React, Framer Motion, state, icons) are split into separately-cached chunks.
- Lazy image loading, `once: true` scroll animations, and Tailwind purging are
  already in place.
- **Vercel Web Analytics** and **Speed Insights** are enabled
  (`@vercel/analytics` + `@vercel/speed-insights` in `client/src/main.tsx`) —
  visitor/page-view counts under Vercel → **Analytics**, and real-user
  performance (LCP, CLS, INP) under Vercel → **Speed Insights**. Both are no-ops
  on localhost.

---

## 🔄 Migrations on Deploy

`db:push` is the project's documented workflow (the DB was set up with
`drizzle-kit push`, so journal-based `db:migrate` will conflict).

**Manual (default):** the Vercel build (`bun run build`) only builds the
frontend — it does **not** touch the database, so a deploy can never fail on
transient DB connectivity. Apply schema changes yourself against the production
database:

```bash
export DATABASE_URL="postgresql://…-pooler…?sslmode=require"
bun run db:push:vercel   # or: bun run db:push  (loads local .env)
```

Because `drizzle-kit push` is idempotent, re-running it with an unchanged schema
is a no-op. There is deliberately **no `--force` flag**: if a change would drop
data, the push fails loudly instead of silently truncating.

**Optional — run it in the build:** set
`"buildCommand": "bun run db:push:vercel && bun run build"` in `vercel.json`.
If you do, `DATABASE_URL` must be available **during the build** for every
environment whose deploys should migrate (Production *and* Preview), because
preview deployments run the same build command.

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
| `error: Script not found "build"` / `db:push:vercel` | **Root Directory is set to a subdirectory.** Go to Project → Settings → General → Root Directory → repo root, Framework Preset → Other, then redeploy. |
| Build fails at `db:push:vercel` / `Cannot reach database` | `DATABASE_URL` is missing from the **build** environment — scope it to Production + Preview in Vercel → Settings → Environment Variables. |
| `/api/...` returns **404** | The dispatcher (`api/[...route].js`) found no matching route in `api-handlers/_routes.js`. All storefront routes are present — see the API reference. Confirm `framework` in `vercel.json` is `null` and the route table has the path. |
| `/api/...` returns **500** | A runtime error in the handler. Check **Function Logs** in Vercel — common causes: missing `DATABASE_URL`, a SQL column mismatch (run `db:push:vercel`), or a missing Supabase env var. |
| Site loads but **no products show** | The SPA rewrite is shadowing the API. It must be `/((?!api/).*)` (excludes `/api/*`). Verify with `curl https://<project>.vercel.app/api/products` — it must return JSON, not HTML. |
| 404 on page refresh / direct URLs | The SPA rewrite `/((?!api/).*) → /index.html` must be present in `vercel.json`. |
| `column does not exist` (500s) | The DB is behind the schema the API expects — run `bun run db:push:vercel` against the production `DATABASE_URL`, or `bun run db:push` locally. |
| `too many connections` from Neon | Switch `DATABASE_URL` to the **pooled** connection string (`-pooler`). |
| Images fail to upload / 404 | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set? `products` bucket **public**? |
| Admin login fails | Guide-style: are `ADMIN_EMAIL`/`ADMIN_PASSWORD` set? App-style: is the account's `users.role = 'admin'`? |
| JWT auth fails after deploy | `JWT_SECRET` missing or different between environments — and it is now **enforced** (500s/401s if unset or placeholder in production). |
| Function times out (admin uploads) | Add the `functions.maxDuration` block for `api/[...route].js` (see Step 4) — 10 s default can be tight for multi-image uploads. |

---

## 📚 Useful Links

- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vercel File-system Routing (`[id].js`)](https://vercel.com/docs/functions/file-system-routing)
- [Vercel Monorepos](https://vercel.com/docs/monorepos)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Neon Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- Original guide: `docs/gadget-wallet-vercel-update-guide.md`
