import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdirSync, existsSync } from "fs";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

// Resolved against the process CWD so it stays correct whether this module is
// run from source (bun run dev) or from a bundled dist file (Vercel build).
// Only ever written to in dev — production requires Supabase Storage.
export const UPLOADS_DIR = join(process.cwd(), "uploads");
const BUCKET = "products";

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction && !existsSync(UPLOADS_DIR)) {
  try {
    mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch {
    // Read-only filesystem (e.g. serverless) — disk fallback is dev-only anyway.
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// .env.example ships placeholder values — a real key is a JWT/sb_secret that
// never contains "your-", and a real project URL is never "xxxx". Treating
// placeholders as "not configured" keeps dev mode on the local-disk fallback
// and fails loudly in production instead of attempting (and failing) real
// uploads with invalid credentials. Keep in sync with the placeholder list in
// packages/db/src/loadEnv.ts.
function isPlaceholderKey(key: string): boolean {
  return /your-/.test(key) || key === "xxx";
}

function isPlaceholderUrl(url: string): boolean {
  return /xxxx\.supabase\.co/.test(url);
}

const hasSupabaseCredentials =
  !!supabaseUrl &&
  !!supabaseKey &&
  !isPlaceholderKey(supabaseKey) &&
  !isPlaceholderUrl(supabaseUrl);

const supabase: SupabaseClient | null = hasSupabaseCredentials
  ? createClient(supabaseUrl!, supabaseKey!, { auth: { persistSession: false } })
  : null;

export function isSupabaseConfigured() {
  return supabase !== null;
}

if (!hasSupabaseCredentials && !isProduction) {
  console.warn(
    "[storage] Supabase Storage not configured (missing or placeholder SUPABASE_SERVICE_ROLE_KEY). " +
      "Falling back to local-disk uploads for development.",
  );
}

/**
 * Allowed upload extensions (server-side whitelist — never trust the client).
 * Mirrors the MIME check done in the routes layer.
 */
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export function isAllowedImage(file: { name: string; type: string; size: number }): boolean {
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) return false;
  if (!file.type.startsWith("image/")) return false;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Produces a unique, safe file name: {timestamp}-{random}.{ext}
 * The extension is forced from the whitelist, so a malicious name like
 * "..%2f..%2fpayload" can never sneak through.
 */
export function sanitizeFileName(name: string): string {
  const ext = (name.split(".").pop() || "jpg").toLowerCase();
  const safeExt = (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext) ? ext : "jpg";
  return `${Date.now()}-${randomUUID().slice(0, 12)}.${safeExt}`;
}

/**
 * Storage layout: products/{productId}/{fileName}
 * Grouping files under the product id makes it physically impossible for
 * one product's images to be confused with another's.
 */
export function buildStoragePath(productId: string, fileName: string): string {
  return `${BUCKET}/${productId}/${fileName}`;
}

export interface UploadedImage {
  /** Fully qualified public URL (what the browser loads). */
  url: string;
  /** Storage path (products/{productId}/{file}) — what we delete by. */
  path: string;
}

/**
 * Uploads an image to Supabase Storage (or local disk in dev) under the
 * product-namespaced folder.
 */
export async function uploadImage(file: File, productId: string): Promise<UploadedImage> {
  if (!supabase) {
    if (isProduction) {
      throw new Error(
        "Supabase Storage is not configured. Set a real SUPABASE_SERVICE_ROLE_KEY (server-side env var) before uploading images.",
      );
    }
    // Dev fallback: write to local disk, mirroring the same folder layout.
    const fileName = sanitizeFileName(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const dir = join(UPLOADS_DIR, "products", productId);
    mkdirSync(dir, { recursive: true });
    await writeFile(join(dir, fileName), buffer);
    return {
      url: `/uploads/products/${productId}/${fileName}`,
      path: buildStoragePath(productId, fileName),
    };
  }

  const fileName = sanitizeFileName(file.name);
  const storagePath = buildStoragePath(productId, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error(`[storage] Supabase upload failed for ${storagePath}:`, error.message);
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { url: data.publicUrl, path: storagePath };
}

/**
 * Converts a stored URL or storage path into a bucket-relative path we are
 * allowed to delete. Returns null for anything outside our bucket layout
 * (e.g. external placeholder URLs), so we never touch files we don't own.
 */
export function extractStoragePath(pathOrUrl: string): string | null {
  if (!pathOrUrl) return null;

  let rel: string | null = null;

  if (pathOrUrl.includes(`/storage/v1/object/public/${BUCKET}/`)) {
    rel = pathOrUrl.split(`/storage/v1/object/public/${BUCKET}/`)[1] ?? null;
  } else if (pathOrUrl.startsWith("/uploads/")) {
    rel = pathOrUrl.replace(/^\/uploads\//, "");
  } else if (pathOrUrl.startsWith(`${BUCKET}/`)) {
    rel = pathOrUrl;
  }

  if (!rel) return null;

  // Only allow paths under products/<uuid>/<file> (product images),
  // products/avatars/<userId>/<file> (profile photos), or legacy flat
  // products/<file>.
  if (/^products\/[0-9a-fA-F-]{36}\/[^/]+$/.test(rel)) return rel;
  if (/^products\/avatars\/[^/]+\/[^/]+$/.test(rel)) return rel;
  if (/^products\/[^/]+\.[a-zA-Z0-9]+$/.test(rel)) return rel;
  return null;
}

/**
 * Deletes an image file from storage by its stored URL or storage path.
 * Safe to call with external URLs (no-op).
 */
export async function deleteImage(pathOrUrl: string): Promise<void> {
  const storagePath = extractStoragePath(pathOrUrl);
  if (!storagePath) return;

  if (supabase) {
    const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (error) console.error("Failed to delete image from Supabase:", error.message);
    return;
  }

  const filepath = join(UPLOADS_DIR, storagePath);
  try {
    await unlink(filepath);
  } catch {
    /* file may not exist */
  }
}
