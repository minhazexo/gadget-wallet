# Gadget Wallet — Premium Electronics eCommerce

A full-stack premium electronics eCommerce store. React storefront + Hono API
deployed to Vercel as a **single monolith project** — frontend and API share one
domain, with a Neon PostgreSQL database and Supabase Storage for product images.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Plain Node.js serverless functions on Vercel; the Hono API under `apps/server` is kept for local development
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Image Storage**: Supabase Storage (public `products` bucket; local disk fallback in dev)
- **Styling**: Tailwind CSS + Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Analytics**: Vercel Web Analytics + Speed Insights

## Project Structure

```
gadget-wallet/
├── api/                        # Vercel serverless functions (Node.js, native ESM)
│   └── [...route].js           # ONE catch-all function — dispatches every /api/*
│                               #   request to the matching api-handlers/ route
├── api-handlers/               # All 54 route handlers (kept OUTSIDE api/ so
│   ├── _lib/                   #   Vercel deploys exactly 1 function — under the
│   │   └── …                   #   Hobby plan's 12-function limit)
│   ├── _routes.js              #   path→handler route table (products, auth,
│   ├── products/               #   cart, wishlist, orders, admin, reviews,
│   ├── categories/             #   address, payment-methods, notifications,
│   ├── brands/                 #   recently-viewed, health …)
│   ├── auth/
│   ├── profile/
│   ├── admin/
│   └── …
├── client/                     # React + Vite frontend
│   └── src/
│       ├── pages/              # Storefront + admin pages
│       └── store/              # Zustand stores (auth, cart, wishlist, toast)
├── apps/
│   └── server/
│       └── src/
│           ├── app.ts          # The whole Hono app (runtime-agnostic, dev only)
│           ├── index.ts        # Bun.serve wrapper (local dev only)
│           ├── routes/         # auth, products, admin, orders, …
│           └── utils/          # storage (Supabase), response helpers
├── packages/
│   ├── ui/                     # Shared React components
│   ├── db/                     # Drizzle schema + migrations + seed
│   └── types/                  # Shared TypeScript types
├── docs/
│   └── DEPLOY_TO_VERCEL.md     # Full deployment guide
├── vercel.json                 # Vercel build + SPA rewrite config
└── package.json                # Bun workspaces root ("type": "module")
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.1+
- [Neon PostgreSQL](https://neon.tech) — app data
- [Supabase](https://supabase.com) — product images (optional in dev; required in production)

### Setup

```bash
# 1. Install dependencies
bun install

# 2. Copy and configure environment variables
cp .env.example .env
#    - DATABASE_URL                → your Neon connection string
#    - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY → for image uploads
#    - JWT_SECRET                  → any long random string

# 3. Apply schema and seed demo data
bun run db:push
bun run db:seed

# 4. Start development (web on :5183 + API on :3000)
bun run dev
```

> Without Supabase credentials the app falls back to local disk for uploaded
> images (dev only) — in production the server requires Supabase.

### Default Admin

- Email: `admin@gadgetwallet.com`
- Password: `admin123`

## Scripts (root `package.json`)

| Script | Description |
|--------|-------------|
| `bun run dev` | Run web + API in parallel (dev mode) |
| `bun run build` | Production build: `client` (`tsc -b && vite build` → `client/dist`) |
| `bun run typecheck` | Typecheck web + server (`tsc --noEmit` in each) |
| `bun run db:generate` | Generate Drizzle migrations from `packages/db/src/schema.ts` |
| `bun run db:push` | Apply schema to the database (loads `.env`) |
| `bun run db:push:vercel` | Same, but reads env from the environment |
| `bun run db:seed` | Seed admin user, categories, brands, products, banners |
| `bun run --env-file=.env scripts/smoke-api.mjs` | Smoke-test the whole API (36 checks: products, auth, cart, wishlist, orders, admin, …) |

## Features

- Cinematic hero section with video background
- 20+ public pages (Home, Shop, Product Details, Cart, Checkout, …) + full admin dashboard
- Product management with **multi-image uploads to Supabase** (drag & drop, cover selection, reordering)
- Shopping cart (guest + persistent), wishlist, order management, reviews
- User profile: addresses, payment methods, notifications, recently viewed, security
- **Show/hide password toggles** on login, register, and security forms
- Fully responsive — storefront **and** admin (mobile navigation included)
- Framer Motion animations, dark premium theme
- Vercel Web Analytics (visitors + page views) and Speed Insights (real-user performance)

## Deployment (Vercel)

The whole app — storefront + API — deploys to **one Vercel project** from this
repo. `vercel.json` handles the build (`bun run build`), the storefront is
served from `client/dist`, and the API runs as a **single catch-all serverless
function** (`api/[...route].js`) that dispatches every `/api/*` request to the
matching handler in `api-handlers/` (products, categories, brands, auth,
profile, admin, cart, wishlist, orders, reviews, address, payment-methods,
notifications, recently-viewed, health — 54 routes, 1 deployed function, so it
stays under the Hobby plan's 12-function limit). The root `package.json`
declares `"type": "module"`, so the dispatcher runs as native ESM. The Hono
app under `apps/server` is kept for local development only. Run migrations
manually after deploying — or wire `bun run db:push:vercel` into your deploy
pipeline — since they don't run as part of the Vercel build.

```bash
# 1. Push the repo to GitHub
# 2. Import it in Vercel (Root Directory = repo root, Framework Preset = Other;
#    vercel.json sets buildCommand = bun run build, outputDirectory = client/dist)
# 3. Add env vars: DATABASE_URL (pooled, scope to Production + Preview),
#    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, APP_URL
# 4. Run migrations: bun run db:push:vercel
# 5. Deploy 🚀
```

Verify: `GET /api/health`, `GET /api/products`, log in with the admin
credentials, and create a product with an image upload. Or run the whole API
smoke suite locally:

```bash
bun run --env-file=.env scripts/smoke-api.mjs   # → 36/36 checks passed
```

> 📖 Full step-by-step guide, env var table, troubleshooting, and Neon pooling
> tips: **`docs/DEPLOY_TO_VERCEL.md`**.
