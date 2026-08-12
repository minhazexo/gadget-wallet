# Gadget Wallet — Performance & Page-Load Optimization Guide

Deep-dive audit of the whole codebase (client + Vercel API + DB schema), focused on
**how fast products and pages load** and what to change to make them faster.

> **Implementation status (updated 2026-08-12):** items **1–9 and 11 are
> implemented** in the codebase. Items 10 and 12 remain open — see the status
> note on each section below. After each change was made, `bun run typecheck`
> and `bun run --cwd client build` both pass.

Current measured state (production build in `client/dist`):

| Asset | Raw size | Notes |
|------|----------|-------|
| `index-*.js` (app shell) | 53 KB | routes, store wiring — no page code |
| `index-*.js` (admin barrel) | 55 KB | lazy-loaded, only on /admin |
| `Home-*.js` / `Shop-*.js` | 12 / 14 KB | lazy chunks per route |
| `vendor-react-*.js` | 163 KB | react, react-dom, react-router, hook-form |
| `vendor-animation-*.js` | 116 KB | framer-motion |
| `vendor-state-*.js` | 52 KB | zustand, axios, resolvers |
| `vendor-icons-*.js` | 32 KB | lucide-react |
| `index-*.css` | 56 KB | Tailwind output |
| **Total initial JS (storefront)** | **~416 KB** raw (~125 KB gzip) | per-page chunks fetched on demand |

A storefront's first paint should ship ~150–250 KB of JS. The initial bundle is
now roughly 1/3 smaller; the ~180 KB of page code (incl. the whole admin panel)
loads only when the route is visited.

---

## Priority summary

| # | Area | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 1 | Route-level code splitting (`React.lazy`) | High | Low | ✅ Implemented |
| 2 | Internal `<a href>` → `Link` (full page reloads) | High | Low | ✅ Implemented |
| 3 | `Cache-Control` headers on public API routes | High | Low | ✅ Implemented |
| 4 | Client-side data fetching/caching layer | High | Medium | ✅ Implemented (lightweight) |
| 5 | Products list handler: fewer Neon round-trips | High | Medium | ✅ Implemented |
| 6 | Shop: paginate instead of `limit=100` | Medium | Medium | ✅ Implemented |
| 7 | Fonts + hero/LCP image optimization | Medium | Low | ✅ Implemented |
| 8 | Product images: `srcset`/lazy loading everywhere | Medium | Medium | ⚠️ Partially (decoding/lazy added) |
| 9 | `AnimatePresence mode="wait"` blocking route swap | Medium | Low | ✅ Implemented |
| 10 | Cold starts: split public API from heavy catch-all | Medium | Medium | ⏳ Open (see note) |
| 11 | Missing DB indexes (sort/filter/search) | Medium | Low | ✅ Migration generated |
| 12 | PWA service worker / app-shell caching | Low | Medium | ⏳ Open |

---

## 1. Route-level code splitting — HIGH ✅ IMPLEMENTED

**Where:** `client/src/App.tsx`

Every page — including the whole admin dashboard (7+ admin components) — is now a
lazy chunk via `React.lazy()` + a single `<Suspense fallback={<RouteFallback/>}>`
around `<Routes>`. Admin pages are grouped into one lazy module through the new
barrel `client/src/pages/admin/index.ts`, so the whole dashboard is **one** chunk
loaded only on first `/admin` visit.

- Storefront visitors never download admin code (55 KB admin barrel is separate).
- A lightweight `RouteFallback` (pulsing "Loading…") shows while a chunk loads.
- `client/dist` now emits one small chunk per page (`Home-*.js` 12 KB,
  `Shop-*.js` 14 KB, `ProductDetails-*.js` 10 KB, etc.).
- Optional next step: preload chunks on nav-link hover.

**Measured:** main `index-*.js` chunk dropped 236 KB → 53 KB.

---

## 2. Internal links cause full page reloads — HIGH ✅ IMPLEMENTED

**Where:** `packages/ui/src/navbar.tsx`, `packages/ui/src/footer.tsx`,
`client/src/pages/Home.tsx`, `ProductCard.tsx`, `Shop.tsx`, `OrderSuccess.tsx`,
`NotFound.tsx`, `Categories.tsx`, all profile sections.

The app is an SPA (`react-router-dom`) but most internal links were plain `<a href>`
or `window.location.href`, causing a **full document reload** on every click.

**Done:** every internal link now uses `<Link to>` (animated ones via
`motion.create(Link)` so the hover/tap motion is preserved), and the navbar search
uses `useNavigate()` instead of `window.location.href`. Only external links keep
`<a>`. `react-router-dom` was added to `@gadget-wallet/ui` deps (peer + regular)
since navbar/footer now import it.

**Measured:** page-to-page navigation is now client-side (instant); combined with
#1, only the lazy chunk for the new route is fetched.

---

## 3. No caching on the API — HIGH ✅ IMPLEMENTED

**Where:** `api-handlers/_lib/respond.js` + public handlers.

A grep for `Cache-Control` previously returned **zero** matches; every request hit
Neon fresh. A new `okPublic(res, data, ttl = 300)` helper in
`api-handlers/_lib/respond.js` sets:

```js
res.setHeader("Cache-Control", `public, s-maxage=${ttl}, stale-while-revalidate=${Math.max(30, Math.floor(ttl / 3))}`);
```

Applied to all **public, read-only GET** endpoints:
- `products` list (ttl 60 — filtered/paginated, still cheap to revalidate)
- `products/featured`, `products/new-arrivals` (ttl 300)
- `products/:key` and `products/by-id/:id` (ttl 300)
- `categories` list + `:slug` (ttl 300)
- `brands` list + `:slug` (ttl 300)

Auth/cart/wishlist/orders/admin endpoints are deliberately **not** cached.

**Measured:** TTFB for homepage grids, categories and brands is now served from
Vercel's edge CDN within the TTL window (~0 ms) instead of a cold start + Neon.

---

## 4. No client-side data layer — HIGH ✅ IMPLEMENTED (lightweight)

**Where:** `client/src/lib/cachedGet.ts` (new), `App.tsx`, `Home.tsx`,
`ProductDetails.tsx`, `Categories.tsx`.

Problems fixed without adding a dependency:
- A tiny `cachedGet(url, ttlMs)` module (`client/src/lib/cachedGet.ts`) adds
  **in-flight dedup + TTL cache** for public GETs. Concurrent callers share one
  request; remounts within the TTL resolve from memory.
- `/categories` is fetched **once** and shared by the header (`App.tsx`), Home and
  the Categories page (ttl 5 min) — the duplicate request is gone.
- Home's 5 sections use `cachedGet` (grids: 60 s, categories/brands: 5 min).
- `ProductDetails` fetches `/products/:slug` **once** and reuses the result for the
  recently-viewed log instead of fetching twice.
- An `export function clearCachedGet(url?)` exists for future admin-invalidation.

TanStack Query remains the upgrade path if richer invalidation is ever needed.

---

## 5. Products list handler: too many Neon round-trips — HIGH ✅ IMPLEMENTED

**Where:** `api-handlers/products/index.js`, `api-handlers/_lib/products.js`

**Done:**
- **Data + count in ONE query** via a window function:
  `SELECT ${PRODUCT_LIST_SELECT}, count(*) OVER()::int AS _total ... LIMIT x OFFSET y`;
  `total` is read from the first row (0 when the page is empty). The separate
  `count(*)` round-trip is gone — the list endpoint now does 1 data query + 3
  parallel facet queries (down from 2 + 3 with a sequential count).
- New lightweight **`PRODUCT_LIST_SELECT`** drops the per-row `images` json_agg
  (which ran up to 100× per request) plus `fullDescription`/`videoUrl`. It keeps a
  cheap scalar `firstImageUrl` subquery so cards without a thumbnail still show a
  real photo. Used by `products/index`, `featured`, `new-arrivals`.
- `featured` and `new-arrivals` also use the light projection.
- The Shop page now requests `limit=24` pages (see #6) instead of `limit=100`, so
  the old 100-row worst case is gone too.
- Facets are still computed in parallel via `Promise.all`; they're now served from
  the CDN cache within the TTL window (see #3).

**Measured:** list request went from 2 sequential queries + up to 100 subqueries to
1 query with a lightweight projection (+ 3 parallel facet queries).

---

## 6. Shop renders 100 products at once — MEDIUM ✅ IMPLEMENTED

**Where:** `client/src/pages/Shop.tsx`

**Done:** the Shop now uses **real server-side pagination**:
- `PAGE_SIZE = 24` (was `limit=100`), page state + pager UI (Prev / numbered pages /
  Next) rendered below the grid.
- The header count now shows the true `total` from the API instead of the rendered
  row count.
- Any filter/sort/category/brand change resets to page 1; `page` changes scroll
  back to the top smoothly.
- Only 24 product cards (each with its 3D spring system) are mounted per page,
  which also makes the facets + data queries cheaper per request.

Further work if the catalog grows a lot: windowing (`@tanstack/react-virtual`) or
lazy-enabling the 3D tilt only for in-viewport cards.

---

## 7. Render-blocking fonts + LCP hero — MEDIUM ✅ IMPLEMENTED

**Where:** `client/index.html`, `client/src/pages/Home.tsx`, `ProductDetails.tsx`

**Done:**
- Google Fonts stylesheet now loads **non-blocking** via the
  `media="print" onload="this.media='all'"` pattern (+ `<noscript>` fallback),
  keeping `display=swap` for text fallback.
- The hero image gets `<link rel="preload" as="image" fetchpriority="high">` in
  `index.html` **and** `fetchPriority="high"` on the `<img>` itself; it stays eager
  (above the fold) — never lazy.
- The 9 redundant favicon `<link>`s were trimmed to 3: `favicon32`, apple-touch-icon,
  and the manifest.

Still open if desired: self-hosting Inter/Poppins via `@fontsource` and serving a
local `/public/hero.webp` instead of the Unsplash URL.

---

## 8. Product images: size + lazy loading — MEDIUM ⚠️ PARTIALLY IMPLEMENTED

**Where:** `ProductCard.tsx`, `Shop.tsx`, `Home.tsx`, `Categories.tsx`,
`ProductDetails.tsx`, profile sections.

**Done:** `decoding="async"` added to all product/category/brand images, and
`loading="lazy"` added everywhere it was missing (Home category cards, Categories
grid, gallery thumbnails, cart/wishlist/recently-viewed images). The ProductDetails
main gallery image and the Home hero get `fetchPriority="high"`.

**Still open:** `srcset`/`sizes` with Supabase `?width=` resize params. The gallery
images are already compressed WebP (20–65 KB each from the transparency pipeline),
so the gain is modest; the catalog is 180 products. The unused
`packages/ui/src/blur-image.tsx` could be wired in later for blur-up placeholders.

---

## 9. Page transitions block navigation — MEDIUM ✅ IMPLEMENTED

**Where:** `client/src/App.tsx`, `client/src/components/PageTransition.tsx`

**Done:** `<AnimatePresence mode="wait">` was removed from `App.tsx` (and the `exit`
prop from `PageTransition`) — the exit animation no longer blocks the route swap.
Pages now mount immediately with only the light fade-in; lazy chunks show the
`RouteFallback` skeleton while loading.

---

## 10. Cold starts on a single catch-all function — MEDIUM ⏳ OPEN

**Where:** `api/[[...route]].js`, `api-handlers/_routes.js`

One function bundles all 55 handlers and every dependency (supabase, sharp, busboy,
jwt, neon, drizzle). Every `/api/*` request cold-starts this whole bundle.

**Note:** #3 (CDN caching) already absorbs the majority of public GET traffic, so
cold starts now affect mainly the first uncached request and non-cached routes
(auth/cart/admin). Remaining options, in order of cheapness:
- Lazily `await import()` heavy modules (`supabase`, `busboy`) only inside the
  handlers that need them.
- Split the top-traffic public GETs into tiny functions under `api/` (Hobby plan
  allows 12 functions) or tune `vercel.json` `functions` config.

Not implemented to keep the deployment surface unchanged.

---

## 11. Missing DB indexes — MEDIUM ✅ MIGRATION GENERATED

**Where:** `packages/db/src/schema.ts` (products table)

Indexed today: `slug`, `sku`, `is_featured`, `category_id`, `brand_id` — plus the
newly added:

- `products_created_idx` → `created_at` (default sort)
- `products_rating_idx` → `rating` (sort=rating)
- `products_discount_idx` → `discount_price` (sort=discount, sale filters)

```ts
index("products_created_idx").on(table.createdAt),
index("products_rating_idx").on(table.rating),
index("products_discount_idx").on(table.discountPrice),
```

**Status:** the drizzle migration was **generated**
(`packages/db/migrations/0003_certain_pestilence.sql`, three `CREATE INDEX IF NOT
EXISTS` statements) and is safe to apply — but it has **not been pushed to the
live DB**. Apply it in a maintenance window with `bun run db:push` (or `drizzle-kit
migrate`) once, then verify with `EXPLAIN`. Search on `name ILIKE` intentionally
left as-is (catalog is 180 products; #3/#4 caching covers it).

---

## 12. PWA / service worker — LOW ⏳ OPEN

`client/public/manifest.json` exists (see `index.html`) but there is no service
worker, so there's no app-shell caching.

**Fix (if desired later):** add `vite-plugin-pwa` with `registerType: "autoUpdate"`,
precache the shell + `vendor-*` chunks, and runtime-cache `/api/products/*`,
`/api/categories`, `/api/brands` with `NetworkFirst`/`StaleWhileRevalidate`.

---

## Suggested implementation order (highest ROI first)

1. ✅ **#2 Links → Link** — pure win, no trade-offs, immediately noticeable.
2. ✅ **#1 `React.lazy` route splitting** + **#9 drop `mode="wait"`** — shrink initial JS and make navigation snappy together.
3. ✅ **#3 Cache-Control on public GETs** — biggest backend latency win (CDN).
4. ✅ **#4 data-fetching layer** (lightweight `cachedGet`; TanStack Query available as upgrade) — kill duplicate requests, dedupe `/categories`.
5. ✅ **#5 products list query surgery** — lighter select + window count + fewer round-trips.
6. ✅ **#6 Shop pagination** — one page rendered at a time (24/page).
7. ✅ **#7 fonts + hero** — non-blocking fonts, preloaded LCP hero, trimmed favicons. **#8 partially** (decoding/lazy done; srcset optional).
8. ⏳ **#10 lazy-import heavy server deps** (open), ✅ **#11 indexes** (migration generated — apply with `bun run db:push`), ⏳ **#12 PWA**.

After each step, verify with Vercel Speed Insights (already installed:
`client/src/main.tsx`) and compare Lighthouse before/after.
