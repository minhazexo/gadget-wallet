/**
 * Shared product-image upload helper.
 *
 * Uploads an image buffer to the public `product-images` Supabase bucket at
 * {category}/{file} (upsert — replaces any existing file, e.g. a placeholder),
 * then updates the matching product's product_images row (url + image_path)
 * and products.thumbnail_url in Neon.
 *
 * Used by scripts/fetch-product-images.ts (automated search→upload) and
 * scripts/upload-catalog-images.ts (drop-in local photos).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { db } from "../../packages/db/src/index.js";
import { productImages, products } from "../../packages/db/src/schema.js";

const BUCKET = "product-images";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

/**
 * Uploads `buffer` for a product whose slug is `file` minus its extension
 * (the migration derives slugs from image filenames the same way).
 * Returns the public URL.
 */
export async function uploadProductImage(
  category: string,
  file: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const storagePath = `${BUCKET}/${category}/${file}`;
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Supabase upload failed for ${storagePath}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  const slug = file.replace(/\.(webp|jpe?g|png)$/i, "");
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
  if (!product) throw new Error(`No product matches slug "${slug}" — database not migrated, or file name mismatch`);

  // Update only one (the first) image row for the product, so products with
  // multiple gallery images never get clobbered.
  const [firstImage] = await db
    .select({ id: productImages.id })
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .limit(1);
  if (firstImage) {
    await db.update(productImages).set({ url: data.publicUrl, imagePath: storagePath }).where(eq(productImages.id, firstImage.id));
  }
  await db.update(products).set({ thumbnailUrl: data.publicUrl }).where(eq(products.id, product.id));

  return data.publicUrl;
}
