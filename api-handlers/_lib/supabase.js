import { createClient } from "@supabase/supabase-js";

// Guide step 3 + step 16 — Supabase Storage for product images.
// The service role key is server-only; never expose it to the browser.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

const BUCKET = "products";

function sanitizeFileName(name) {
  const ext = (name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = (name.replace(/\.[^.]+$/, "") || "image")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  // Timestamp + random suffix keeps filenames unique on every upload.
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

/** Server-side whitelist — mirrors apps/server/src/utils/storage.ts. */
export function isAllowedImage(mimetype, size) {
  return (
    ["image/jpeg", "image/png", "image/webp"].includes(mimetype) &&
    size > 0 &&
    size <= 5 * 1024 * 1024
  );
}

/**
 * Uploads a buffer into the public "products" bucket at
 * products/{productId}/{file} and returns { url, path }.
 */
export async function uploadImage(buffer, productId, filename, contentType) {
  if (!supabase) throw new Error("Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  const storagePath = `${BUCKET}/${productId}/${sanitizeFileName(filename)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { url: data.publicUrl, path: storagePath };
}

/**
 * Uploads a buffer into the public "products" bucket at
 * products/categories/{categoryId}/{file} — category cover photos.
 * Returns { url, path }.
 */
export async function uploadCategoryImage(buffer, categoryId, filename, contentType) {
  if (!supabase) throw new Error("Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  const storagePath = `${BUCKET}/categories/${categoryId}/${sanitizeFileName(filename)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { url: data.publicUrl, path: storagePath };
}

/**
 * Uploads a buffer into the public "products" bucket at
 * products/brands/{brandId}/{file} — brand logo images.
 * Returns { url, path }.
 */
export async function uploadBrandImage(buffer, brandId, filename, contentType) {
  if (!supabase) throw new Error("Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  const storagePath = `${BUCKET}/brands/${brandId}/${sanitizeFileName(filename)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { url: data.publicUrl, path: storagePath };
}

/**
 * Buckets that store product media. `product-images` holds the migrated
 * Bangladesh catalog (one file per product, keyed by category folder);
 * `products` holds admin/uploads images as before.
 */
const PRODUCT_BUCKETS = ["products", "product-images"];

/**
 * Deletes a storage object. Accepts either a full public URL or a
 * bucket-relative path (product_images.image_path). Detects which bucket the
 * path belongs to, so migrated (product-images) and admin-uploaded (products)
 * images both clean up correctly.
 */
export async function deleteImage(pathOrUrl) {
  if (!supabase || !pathOrUrl) return;
  for (const bucket of PRODUCT_BUCKETS) {
    const marker = `/storage/v1/object/public/${bucket}/`;
    let rel = null;
    if (pathOrUrl.includes(marker)) rel = pathOrUrl.split(marker)[1];
    else if (pathOrUrl.startsWith(`${bucket}/`)) rel = pathOrUrl;
    if (!rel) continue;
    await supabase.storage.from(bucket).remove([rel]);
    return;
  }
}
