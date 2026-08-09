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
 * Deletes a storage object. Accepts either a full public URL or the
 * products/... relative path (product_images.image_path).
 */
export async function deleteImage(pathOrUrl) {
  if (!supabase || !pathOrUrl) return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  let rel = null;
  if (pathOrUrl.includes(marker)) rel = pathOrUrl.split(marker)[1];
  else if (pathOrUrl.startsWith(`${BUCKET}/`)) rel = pathOrUrl;
  if (!rel) return;
  await supabase.storage.from(BUCKET).remove([rel]);
}
