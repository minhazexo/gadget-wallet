/**
 * Real-product-photo uploader (local files → Supabase + Neon).
 *
 * The image search-links doc (docs/GadgetWallet_60_Product_Image_Search_Links.md)
 * lists a Google Images search and suggested filename for every product.
 * Download the official product photo, save it under the matching category
 * folder, then run:
 *
 *   bun run scripts/upload-catalog-images.ts
 *
 * Layout (names MUST match the doc / the catalog imageFile):
 *   assets/product-images/earphone/xiaomi-mi-in-ear-basic.webp
 *   assets/product-images/power-bank/baseus-bipow-10000mah.webp
 *   ...
 *
 * Every matching file is uploaded to the public `product-images` bucket at
 * {category}/{filename} (upsert — replaces the placeholder at the same URL),
 * and product_images.url/image_path + products.thumbnail_url are updated.
 * Non-image or unmatched files are skipped and reported.
 */
import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { uploadProductImage, isSupabaseConfigured } from "./lib/upload.js";

const ASSETS_DIR = join(process.cwd(), "assets", "product-images");
const ALLOWED_EXT = [".webp", ".jpg", ".jpeg", ".png"];

function contentTypeFor(file: string): string {
  const ext = extname(file).toLowerCase();
  if (ext === ".webp") return "image/webp";
  if (ext === ".png") return "image/png";
  return "image/jpeg";
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
    for (const file of readdirSync(dir)) {
      const ext = extname(file).toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) continue;
      const fullPath = join(dir, file);
      if (!statSync(fullPath).isFile()) continue;

      const buffer = Buffer.from(await Bun.file(fullPath).arrayBuffer());
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

  console.log(`\nDone. Uploaded ${uploaded} image(s), skipped ${skipped}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Upload failed:", err);
    process.exit(1);
  });
