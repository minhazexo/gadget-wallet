# 🚀 Gadget Wallet — Vercel Deployment Guide

## Architecture Overview

This is a **Bun monorepo** with the following structure:

```
gadget-wallet/
├── apps/
│   ├── web/          # Vite + React frontend (port 5173)
│   └── server/       # Hono API server on Bun (port 3000)
├── packages/
│   ├── db/           # Drizzle ORM + PostgreSQL schema + seed
│   ├── ui/           # Shared React UI components
│   └── types/        # Shared TypeScript types
└── package.json      # Bun workspaces root
```

**Stack:**
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Framer Motion
- **Backend:** Hono (Bun-native), Drizzle ORM
- **Database (user data):** PostgreSQL — **Neon.tech** (free tier)
- **File Storage (images):** **Supabase Storage** (free tier) — local disk in dev only
- **Auth:** JWT (jsonwebtoken + bcryptjs)

---

## 📋 Prerequisites

1. **Vercel Account** — [vercel.com](https://vercel.com) (free tier works)
2. **GitHub Repository** — Push this project to GitHub first
3. **Neon Database** — [neon.tech](https://neon.tech) (free tier: 0.5GB storage) — stores **all app data (users, products, orders)**
4. **Supabase Storage** — [supabase.com](https://supabase.com) (free tier: 1GB storage) — stores **product images**
5. **Bun installed** locally (for running seeds) — `npm install -g bun`

---

## 🗄️ Step 1: Set Up Database (Neon PostgreSQL — app data)

> **Data split:** All relational data (users, products, orders, cart, reviews) lives in **Neon PostgreSQL**. Images are stored separately in **Supabase Storage** (Step 2 below).

1. Go to [neon.tech](https://neon.tech) and sign up / log in
2. Create a new project → pick any region close to you
3. After creation, copy the **connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

4. **Run migrations locally** (from your project root):
   ```bash
   # Set the connection string temporarily
   export DATABASE_URL="postgresql://your-neon-connection-string-here"
   
   # Push schema to the database
   bun run db:push
   
   # Seed with sample data
   bun run db:seed
   ```

   > **Note:** The seed creates:
   > - Admin user: `admin@gadgetwallet.com` / `admin123`
   > - 8 categories, 8 brands, 12 products with images & specs
   > - Hero media, banners, and site settings

---

## 🖼️ Step 2: Set Up Image Storage (Supabase Storage)

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Create a new project → pick a region close to you
3. **Create a storage bucket:**
   - Project Dashboard → **Storage** → **New bucket**
   - Name: `products`
   - Enable **Public bucket** (so image URLs are directly accessible without auth)
4. **Get your credentials:** Project Settings → **API**:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **Service role secret** (server-side only — never expose this in the frontend)

---

## ⚙️ Step 3: Environment Variables

Create these environment variables in Vercel (Project Settings → Environment Variables):

### Frontend (`apps/web/`)
| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | `https://your-app.vercel.app/api` | API base URL (your deployed domain) |

### Backend (`apps/server/`)
| Variable | Value | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | `postgresql://...` | Neon PostgreSQL connection string (app data) |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase service role key (image uploads) |
| `JWT_SECRET` | `your-random-secret-string` | JWT signing key (generate a long random string) |
| `APP_URL` | `https://your-app.vercel.app` | CORS origin |
| `PORT` | `3000` | Server port (Vercel sets this automatically) |

> **⚠️ Important:** Run `openssl rand -hex 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` to generate a strong `JWT_SECRET`.

---

## 🏗️ Step 4: Vercel Project Setup

### Option A: Deploy Frontend + API as a Single Vercel Project (Recommended)

Vercel supports deploying **both** the frontend and API from one monorepo using a `vercel.json` configuration.

1. **Push your code to GitHub**

2. **Import project in Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Set **Root Directory** to `apps/web` (for frontend)
   - Framework preset: **Vite**
   - Build command: `cd ../.. && bun install && bun run --cwd apps/web build`
   - Output directory: `dist`

3. **Create `vercel.json` at the project root:**

   ```json
   {
     "functions": {
       "api/**/*.ts": {
         "runtime": "vercel@latest"
       }
     },
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/api/$1"
       },
       {
         "source": "/(.*)",
         "destination": "/"
       }
     ]
   }
   ```

4. **For the API, add `@hono/vercel` adapter:**

   ```bash
   bun add @hono/vercel
   ```

5. **Create `apps/server/src/api/[[route]].ts`** (Vercel serverless entry point):

   ```typescript
   import { handle } from "@hono/vercel";
   import { Hono } from "hono";
   import { cors } from "hono/cors";
   import { logger } from "hono/logger";
   import { secureHeaders } from "hono/secure-headers";
   import { authRoutes } from "../routes/auth";
   import { productRoutes } from "../routes/products";
   import { categoryRoutes } from "../routes/categories";
   import { brandRoutes } from "../routes/brands";
   import { cartRoutes } from "../routes/cart";
   import { wishlistRoutes } from "../routes/wishlist";
   import { orderRoutes } from "../routes/orders";
   import { reviewRoutes } from "../routes/reviews";
   import { couponRoutes } from "../routes/coupons";
   import { adminRoutes } from "../routes/admin";

   const app = new Hono().basePath("/api");

   app.use("*", cors({ origin: process.env.APP_URL || "*", credentials: true }));
   app.use("*", logger());
   app.use("*", secureHeaders());

   app.route("/auth", authRoutes);
   app.route("/products", productRoutes);
   app.route("/categories", categoryRoutes);
   app.route("/brands", brandRoutes);
   app.route("/cart", cartRoutes);
   app.route("/wishlist", wishlistRoutes);
   app.route("/orders", orderRoutes);
   app.route("/reviews", reviewRoutes);
   app.route("/coupons", couponRoutes);
   app.route("/admin", adminRoutes);

   export default handle(app);
   ```

6. **Update Vercel build settings:**
   - **Root Directory:** `.` (project root)
   - **Build Command:** `bun install && bun run build`
   - **Output Directory:** `apps/web/dist`
   - **Install Command:** `bun install`

> **⚠️ Note:** The file uploads route (`/uploads/:filename`) reads from local disk. On Vercel serverless, this won't work for uploaded images. **You must switch to Supabase Storage for file uploads in production.** See the "File Uploads" section below.

---

### Option B: Deploy Frontend Only + Separate API Hosting

If you prefer to keep the API on a separate platform (e.g., Railway, Fly.io, Render):

1. **Deploy the frontend:**
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && bun install && bun run --cwd apps/web build`
   - Output Directory: `dist`
   - Add rewrite rule for SPA routing in `vercel.json`:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/" }]
     }
     ```

2. **Deploy the API separately** on:
   - [Railway](https://railway.app) — Great for Bun apps
   - [Fly.io](https://fly.io) — Supports Bun natively
   - [Render](https://render.com) — Web Services with Docker

3. **Update `VITE_API_URL`** to point to your hosted API

---

## 📁 File Uploads — Production Setup

The current code saves uploaded images to the local `apps/server/uploads/` directory and serves them from `/uploads/:filename`. **This won't work on Vercel** (serverless functions have ephemeral filesystems).

**The production plan:**
- **Images** → **Supabase Storage** (`products` public bucket)
- **All app data** → **Neon PostgreSQL**

### Switch to Supabase Storage

1. **Create a free Supabase account** at [supabase.com](https://supabase.com) (done in Step 2) and create a public `products` bucket.

2. **Add Supabase env vars** to Vercel (done in Step 3):
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Install the Supabase client:**
   ```bash
   bun add @supabase/supabase-js
   ```

4. **Update `apps/server/src/routes/admin.ts`** — Replace the local `writeFile` block with a Supabase upload:
   ```typescript
   import { createClient } from "@supabase/supabase-js";

   const supabase = createClient(
     process.env.SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!,
   );

   // In the image-upload route, replace writeFile with:
   const ext = file.name.split(".").pop() || "jpg";
   const filename = `${randomUUID()}.${ext}`;
   const buffer = Buffer.from(await file.arrayBuffer());

   const { data, error } = await supabase.storage
     .from("products")
     .upload(filename, buffer, { contentType: file.type });

   if (error) return error(c, 500, error.message);

   const { data: publicUrl } = supabase.storage
     .from("products")
     .getPublicUrl(filename);

   const imageUrl = publicUrl.publicUrl; // https://xxxx.supabase.co/storage/v1/object/public/products/uuid.jpg
   ```

   > **Note:** Because Supabase returns a fully qualified URL, the frontend loads images directly — the `/uploads/:filename` proxy route in `apps/server/src/index.ts` is no longer needed for production. The bucket must be **public**.

5. **Update the image-delete route** — Remove the file from the bucket as well as the DB record:
   ```typescript
   // In the delete route, replace the unlink() block with:
   const filename = image.url.split("/").pop();
   if (filename) {
     await supabase.storage.from("products").remove([filename]);
   }
   ```

---

## 🔧 Step 5: Configure `vercel.json`

Create this file in the **project root** if using Option A (monolith deployment):

```json
{
  "buildCommand": "bun install && bun run build",
  "installCommand": "bun install",
  "outputDirectory": "apps/web/dist",
  "framework": null,
  "functions": {
    "api/**/*.ts": {
      "memory": 512,
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 🧪 Step 6: Deploy & Verify

1. **Push to GitHub** — Vercel auto-deploys on push to `main`
2. **Check deployment logs** in Vercel dashboard
3. **Verify endpoints:**
   ```
   GET  https://your-app.vercel.app/api/health
   GET  https://your-app.vercel.app/api/products
   POST https://your-app.vercel.app/api/auth/login
   ```

4. **Login with admin credentials:**
   - Email: `admin@gadgetwallet.com`
   - Password: `admin123`

5. **Verify the frontend** loads at `https://your-app.vercel.app`

---

## 🌐 Step 7: Custom Domain (Optional)

1. Go to your Vercel project → **Settings** → **Domains**
2. Add your custom domain (e.g., `gadgetwallet.com`)
3. Update DNS records at your domain provider as instructed by Vercel
4. Update `APP_URL` / `VITE_API_URL` environment variables to the new domain

---

## ⚡ Performance Optimizations

The project already has:
- ✅ Lazy image loading (`loading="lazy"`)
- ✅ Framer Motion animations (with `viewport: { once: true }` for performance)
- ✅ Tailwind CSS purging (production builds remove unused CSS)
- ✅ Responsive images with `w=128&q=80` query params

Additional Vercel optimizations:
- Enable **Automatic Caching** in Vercel project settings
- Enable **Edge Functions** for the API if you want global low-latency response
- Consider enabling **Automatic Image Optimization** for uploaded product images

---

## 🔄 Post-Deployment Tasks

- [ ] **Set up monitoring** — Vercel Analytics or Sentry
- [ ] **Configure backups** — Neon automatically backs up PostgreSQL
- [ ] **Set up staging branch** — Deploy `staging` branch for testing
- [ ] **Enable HTTPS** — Vercel does this automatically
- [ ] **Set up automated DB migrations** — Run on each deploy via build command

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot find module '@gadget-wallet/ui'` | Ensure `bun install` runs at root level with `--frozen-lockfile` or workspace support enabled |
| Database connection fails | Verify `DATABASE_URL` is correct in Vercel env vars and Neon has no IP allowlist enabled (Neon allows all IPs by default) |
| CORS errors | Check `APP_URL` matches your exact Vercel deployment URL |
| 404 on page refresh | Add SPA rewrite rule in `vercel.json` |
| File uploads fail | Switch to Supabase Storage (see File Uploads section above) and verify `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set |
| Images return 404 | Confirm the `products` bucket is **public** and `SUPABASE_URL` uses `https://` |
| TypeScript build errors | Run `bun run typecheck` locally first to catch issues |
| JWT auth fails | Make sure `JWT_SECRET` is set and consistent across deployments |

---

## 📚 Useful Links

- [Vercel Bun Documentation](https://vercel.com/docs/runtimes#bun)
- [Hono Vercel Adapter](https://hono.dev/docs/getting-started/vercel)
- [Neon PostgreSQL](https://neon.tech/docs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/storage-upload)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
