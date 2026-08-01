import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdirSync, existsSync } from "fs";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const UPLOADS_DIR = join(import.meta.dir, "..", "..", "uploads");
const BUCKET = "products";

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase: SupabaseClient | null = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export function isSupabaseConfigured() {
  return supabase !== null;
}

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (supabase) {
    const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
      contentType: file.type,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return data.publicUrl;
  }

  await writeFile(join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export async function deleteImage(url: string): Promise<void> {
  if (!url) return;
  const filename = url.split("/").pop();
  if (!filename) return;

  if (supabase && url.includes(`/storage/v1/object/public/${BUCKET}/`)) {
    const { error } = await supabase.storage.from(BUCKET).remove([filename]);
    if (error) console.error("Failed to delete image from Supabase:", error.message);
    return;
  }

  const filepath = join(UPLOADS_DIR, filename);
  try {
    await unlink(filepath);
  } catch {
    /* file may not exist */
  }
}
