/**
 * Real-product-photo uploader (local files → Supabase + Neon).
 *
 * Supports BOTH layouts:
 *
 * 1. Per-product folder (preferred — the gallery layout):
 *      assets/product-images/earphone/xiaomi-mi-in-ear-basic/image1.webp
 *      assets/product-images/earphone/xiaomi-mi-in-ear-basic/image2.webp
 *      assets/product-images/earphone/xiaomi-mi-in-ear-basic/image3.webp
 *    The folder name IS the product slug. Every image{N} file is uploaded to
 *    {category}/{slug}/image{N}.webp and the product_images rows are upserted
 *    by order (order 0 = cover / thumbnail).
 *
 * 2. Flat legacy layout (kept for back-compat):
 *      assets/product-images/earphone/xiaomi-mi-in-ear-basic.webp
 *    Uploaded as {category}/{filename} and updates the first image row.
 *
 * Run:
 *   bun run scripts/upload-catalog-images.ts
 *
 * Every matching file is uploaded to the public `product-images` bucket
 * (upsert — replaces any existing file at the same URL). Non-image or
 * unmatched files are skipped and reported.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import {
  uploadProductGallery,
  uploadProductImage,
  isSupabaseConfigured,
  type GalleryImage,
} from "./lib/upload.js";

const ASSETS_DIR = join(process.cwd(), "assets", "product-images");
const ALLOWED_EXT = [".webp", ".jpg", ".jpeg", ".png"];
const IMAGE_NAME_RE = /^image(\d+)(\.webp|\.jpe?g|\.png)$/i;

function contentTypeFor(file: string): string {
  const ext = extname(file).toLowerCase();
  if (ext === ".webp") return "image/webp";
  if (ext === ".png") return "image/png";
  return "image/jpeg";
}

function readFileSafe(fullPath: string): Buffer {
  return readFileSync(fullPath);
}

async function main() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  let uploaded = 0;
  let skipped = 0;

  const categories = readdirSync(ASSETS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const category of categories) {
    const dir = join(ASSETS_DIR, category);
    if (category === "README.md") continue;

    const entries = readdirSync(dir, { withFileTypes: true });

    // ── Per-product folders: {category}/{slug}/image{N}.* ──
    for (const entry of entries.filter((e) => e.isDirectory())) {
      const pdir = join(dir, entry.name);
      const slug = entry.name;

      const images: GalleryImage[] = [];
      for (const file of readdirSync(pdir)) {
        const m = file.match(IMAGE_NAME_RE);
        if (!m) continue;
        const order = parseInt(m[1], 10) - 1; // image1 → order 0
        if (order < 0 || order > 2) continue;
        const fullPath = join(pdir, file);
        if (!statSync(fullPath).isFile()) continue;
        const buffer = readFileSafe(fullPath);
        images.push({
          file,
          buffer,
          contentType: contentTypeFor(file),
          order,
          alt: `${slug} — ${order === 0 ? "cover" : `view ${order + 1}`}`,
        });
      }

      if (images.length === 0) {
        skipped++;
        console.log(`  ⏭ ${category}/${slug}/ — no image1/2/3 files found`);
        continue;
      }

      try {
        // Sort by order so the cover is always image1.
        images.sort((a, b) => a.order - b.order);
        const urls = await uploadProductGallery(category, slug, images);
        console.log(`  ✅ ${category}/${slug}/ (${images.length} images) -> ${urls[0]}`);
        uploaded++;
      } catch (err) {
        console.log(`  ⏭ ${category}/${slug}/ — ${(err as Error).message}`);
        skipped++;
      }
    }

    // ── Flat legacy files: {category}/{slug}.webp ──
    for (const file of entries.filter((e) => e.isFile()).map((e) => e.name)) {
      const ext = extname(file).toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) continue;
      const fullPath = join(dir, file);
      if (!statSync(fullPath).isFile()) continue;

      const buffer = readFileSafe(fullPath);
      try {
        const url = await uploadProductImage(category, file, buffer, contentTypeFor(file));
        console.log(`  ✅ ${category}/${file} -> ${url}`);
        uploaded++;
      } catch (err) {
        console.log(`  ⏭ ${category}/${file} — ${(err as Error).message}`);
        skipped++;
      }
    }
  }

  console.log(`\nDone. Uploaded ${uploaded} product(s)/image(s), skipped ${skipped}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Upload failed:", err);
    process.exit(1);
  });
