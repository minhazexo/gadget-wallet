# GadgetWallet — Real Product Photos

All **60 products are now live with real product photos** — fetched automatically from Bing/Google/DuckDuckGo image search, converted to WebP, uploaded to Supabase, and wired to the database.

## Two ways to get photos

### 1. Automated (recommended) — `fetch-product-images.ts`

The full pipeline: **search → download → white-background check → WebP 1200×1200 → save → upload → DB update**.

```bash
# All 60 products (resumable — already-done products are skipped)
bun run scripts/fetch-product-images.ts

# One product, or a subset
bun run scripts/fetch-product-images.ts --slug redmi-buds-5
bun run scripts/fetch-product-images.ts --limit 10

# Download + save only (no Supabase/DB changes)
bun run scripts/fetch-product-images.ts --save-only

# Re-fetch everything
bun run scripts/fetch-product-images.ts --force

# Other options: --provider bing | google | duckduckgo | all, --delay <ms>,
# --no-convert, --no-white-check, --no-thumbs, --max-attempts <n>, --min-dim <px>
```

- **Search engines:** tries Google Images first (blocked on some networks — yields nothing), then Bing (the reliable workhorse), then DuckDuckGo.
- **Quality:** rejects non-images and images below the minimum resolution, prefers white-background product shots (checks edge pixels via sharp), and falls back to Bing CDN thumbnails for hotlink-protected images.
- **Resumable:** products whose file already exists in this folder are skipped, so interrupted runs pick up where they left off. `--force` re-fetches.
- **Politeness:** defaults to a 1200 ms delay between products. If search engines throttle you, raise `--delay` and re-run.

### 2. Manual drop-in — `upload-catalog-images.ts`

Prefer a specific photo you found yourself? Save it into the category folder with the **exact filename** from the checklist, then:

```bash
bun run scripts/upload-catalog-images.ts
```

Uploads every matching local file (upsert — replaces the existing image at the same URL), updates `product_images` + `thumbnail_url`, and reports non-matching files.

## Current state

- ✅ All 60 real photos fetched, saved under this folder, and uploaded to Supabase
- ✅ `product_images.url` + `products.thumbnail_url` point at the real photos
- Each product's image lives at `product-images/{category}/{slug}.webp`

## Notes

- Photos come from public image search (Bing/Google/DuckDuckGo) and are typically owned by the brands/retailers. Use only for products you're authorised to sell, and double-check anything unusual before launch.
- Re-running the fetcher is safe: uploads upsert at the same URL, so storefront URLs never change.
- The old branded placeholder SVG files are replaced in place — no cache-busting needed beyond Supabase's CDN cache.

## Category checklists

- [x] [Earphone (earphone)](./earphone/CHECKLIST.md) — 10 photos
- [x] [Power Bank (power-bank)](./power-bank/CHECKLIST.md) — 10 photos
- [x] [USB Cable (usb-cable)](./usb-cable/CHECKLIST.md) — 10 photos
- [x] [Glass Protector (glass-protector)](./glass-protector/CHECKLIST.md) — 10 photos
- [x] [Earbuds (earbuds)](./earbuds/CHECKLIST.md) — 10 photos
- [x] [Smart Watch (smart-watch)](./smart-watch/CHECKLIST.md) — 10 photos

## Total

**60 products / 60 real photos** across 6 categories.
