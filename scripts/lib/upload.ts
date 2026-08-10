/**
 * Shared product-image upload helpers.
 *
 * Two entry points:
 *
 * 1. uploadProductImage(category, file, buffer, contentType) — legacy single
 *    upload (flat layout, {category}/{file}). Updates the product's FIRST
 *    product_images row + thumbnail_url. Kept for upload-catalog-images.ts.
 *
 * 2. uploadProductGallery(category, slug, images[]) — the per-product gallery
 *    layout ({category}/{slug}/image{N}.webp). Uploads every image, then
 *    upserts product_images rows BY ORDER (order 0 = cover) and keeps
 *    products.thumbnail_url pointing at image 1.
 *
 * Bucket: public `product-images` (upsert — replaces any existing file).
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

export interface GalleryImage {
  /** Local file name, e.g. image1.webp — becomes the storage file name. */
  file: string;
  buffer: Buffer;
  contentType: string;
  /** 0-based gallery slot. Order 0 is the cover / thumbnail. */
  order: number;
  /** Short alt text describing this view. */
  alt: string;
}

async function uploadToBucket(storagePath: string, buffer: Buffer, contentType: string): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Supabase upload failed for ${storagePath}: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

/**
 * Uploads a full 3-image gallery for one product at
 * {category}/{slug}/image{N}.webp and upserts the product_images rows by
 * order. Order 0 becomes the cover: products.thumbnail_url is pointed at it
 * and its isPrimary flag is set.
 */
export async function uploadProductGallery(
  category: string,
  slug: string,
  images: GalleryImage[],
): Promise<string[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
  if (!product) throw new Error(`No product matches slug "${slug}" — database not migrated, or file name mismatch`);

  const urls: string[] = [];
  const uploads: { order: number; url: string; imagePath: string; alt: string }[] = [];

  for (const img of images) {
    const imagePath = `${BUCKET}/${category}/${slug}/${img.file}`;
    const url = await uploadToBucket(imagePath, img.buffer, img.contentType);
    urls.push(url);
    uploads.push({ order: img.order, url, imagePath, alt: img.alt });
  }

  // Upsert rows by order so existing galleries are updated in place and the
  // row ids stay stable (admin image-management depends on them).
  const existingRows = await db
    .select({ id: productImages.id, order: productImages.order })
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(productImages.order);

  for (const up of uploads) {
    const row = existingRows.find((r) => r.order === up.order);
    if (row) {
      await db
        .update(productImages)
        .set({ url: up.url, imagePath: up.imagePath, alt: up.alt, isPrimary: up.order === 0 })
        .where(eq(productImages.id, row.id));
    } else {
      await db.insert(productImages).values({
        productId: product.id,
        url: up.url,
        imagePath: up.imagePath,
        alt: up.alt,
        order: up.order,
        isPrimary: up.order === 0,
      });
    }
  }

  const cover = uploads.find((u) => u.order === 0) ?? uploads[0];
  if (cover) {
    await db.update(products).set({ thumbnailUrl: cover.url }).where(eq(products.id, product.id));
  }

  return urls;
}

/**
 * Legacy single-image upload (flat layout {category}/{file}).
 * Updates the product's first image row + thumbnail_url.
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
  const url = await uploadToBucket(storagePath, buffer, contentType);

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
    await db.update(productImages).set({ url, imagePath: storagePath }).where(eq(productImages.id, firstImage.id));
  }
  await db.update(products).set({ thumbnailUrl: url }).where(eq(products.id, product.id));

  return url;
}
