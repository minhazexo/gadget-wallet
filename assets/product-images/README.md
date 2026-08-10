# GadgetWallet — Real Product Photos

All **60 products are live with 3 real product photos each** — fetched automatically from Bing/Google/DuckDuckGo image search, converted to WebP, uploaded to Supabase, and wired to the database.

## Folder structure

Each product has its own folder with 3 images (`image1.webp` = cover, `image2.webp` + `image3.webp` = additional views):

```
assets/product-images/{category}/{slug}/
  image1.webp   ← the product's existing photo (never replaced)
  image2.webp   ← new professional photo
  image3.webp   ← new professional photo
```

Example: `assets/product-images/earbuds/redmi-buds-5/image1.webp` … `image3.webp`

## Two ways to get photos

### 1. Automated (recommended) — `fetch-product-images.ts`

The full pipeline: **search → download → white-background check → WebP 1200×1200 → save → upload → DB update**.

```bash
# All 60 products, 3 photos each (resumable — done products are skipped)
bun run scripts/fetch-product-images.ts --gallery

# One product, or a subset
bun run scripts/fetch-product-images.ts --gallery --slug redmi-buds-5
bun run scripts/fetch-product-images.ts --gallery --limit 10

# Single photo per product (legacy)
bun run scripts/fetch-product-images.ts

# Download + save only (no Supabase/DB changes)
bun run scripts/fetch-product-images.ts --gallery --save-only

# Re-fetch (re-downloads the two NEW images; the existing cover is always kept)
bun run scripts/fetch-product-images.ts --gallery --force

# Other options: --provider bing | google | duckduckgo | all, --delay <ms>,
# --no-convert, --no-white-check, --no-thumbs, --max-attempts <n>, --min-dim <px>
```

**Gallery mode guarantees:**
- **image1 is the product's EXISTING photo** — it is never replaced or removed, only relocated into the per-product folder and kept as the cover.
- image2 + image3 are **2 new distinct professional photos** from the search (prefers white backgrounds, rejects low-res, falls back to Bing CDN thumbnails for hotlink-protected originals).
- If a product genuinely has only one usable search photo, the two extra views are generated from the cover so every product always ends up with exactly 3 images.
- All 3 upload to Supabase at `{category}/{slug}/image{N}.webp` (upsert) and the `product_images` rows are upserted **by order** (order 0 = cover → `products.thumbnail_url`).

### 2. Manual drop-in — `upload-catalog-images.ts`

Prefer a specific photo you found yourself? Save it into the product folder with the exact filename, then:

```bash
bun run scripts/upload-catalog-images.ts
```

Supports both layouts:
- **Per-product folder:** `{category}/{slug}/image1.webp` … `image3.webp` → uploaded as a gallery (by order).
- **Flat legacy:** `{category}/{slug}.webp` → uploaded as a single image.

Uploads every matching local file (upsert — replaces the existing image at the same URL), updates `product_images` + `thumbnail_url`, and reports non-matching files.

## Current state

- ✅ All 60 products have **3 real photos** each (180 images total)
- ✅ Saved under this folder in per-product folders, uploaded to Supabase
- ✅ `product_images.url` (3 rows per product) + `products.thumbnail_url` point at the real photos
- ✅ Product details page shows a 3-thumbnail gallery with click-to-switch; product cards hover-swap to image2

## Notes

- Photos come from public image search (Bing/Google/DuckDuckGo) and are typically owned by the brands/retailers. Use only for products you're authorised to sell, and double-check anything unusual before launch.
- Re-running the fetcher is safe: uploads upsert at the same URL, so storefront URLs never change.
- A handful of products (hotlink-protected retailers) use a Bing CDN thumbnail for one of the two new views — the script prints a warning list; re-run with `--force` later to retry a full-size photo, or drop a better one in manually and re-run the uploader.

## Category checklists

- [x] [Earphone (earphone)](./earphone/CHECKLIST.md) — 10 photos
- [x] [Power Bank (power-bank)](./power-bank/CHECKLIST.md) — 10 photos
- [x] [USB Cable (usb-cable)](./usb-cable/CHECKLIST.md) — 10 photos
- [x] [Glass Protector (glass-protector)](./glass-protector/CHECKLIST.md) — 10 photos
- [x] [Earbuds (earbuds)](./earbuds/CHECKLIST.md) — 10 photos
- [x] [Smart Watch (smart-watch)](./smart-watch/CHECKLIST.md) — 10 photos

## Total

**60 products / 180 real photos** (3 per product) across 6 categories.
