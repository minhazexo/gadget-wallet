import { db } from "./index.js";
import { products, productImages } from "./schema.js";
import { eq, isNull, sql } from "drizzle-orm";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "products";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } }) : null;

const PLACEHOLDER_COLORS = ["#e11d2e", "#2563eb", "#16a34a", "#9333ea", "#f59e0b", "#0ea5e9", "#db2777", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];

async function uploadPlaceholder(productId: string, title: string, index: number) {
  if (!supabase) throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");

  const fileName = `${Date.now()}-reseed-${index}.svg`;
  const storagePath = `${BUCKET}/${productId}/${fileName}`;
  const color = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="${color}"/><circle cx="400" cy="330" r="150" fill="rgba(255,255,255,0.18)"/><text x="400" y="560" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="700" fill="#ffffff" text-anchor="middle">${title}</text><text x="400" y="620" font-family="Inter, Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.75)" text-anchor="middle">Gadget Wallet</text></svg>`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, svg, {
    contentType: "image/svg+xml",
    upsert: true,
  });
  if (error) throw new Error(`Failed to upload image for ${title}: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { path: storagePath, url: data.publicUrl };
}

async function reseed() {
  if (!supabase) {
    console.error("Supabase not configured — nothing to do.");
    process.exit(1);
  }

  const live = await db.select().from(products).where(isNull(products.deletedAt));
  console.log(`Found ${live.length} live products.`);

  for (const p of live) {
    // Remove old image rows (picsum URLs) for this product.
    await db.delete(productImages).where(eq(productImages.productId, p.id));

    const rows: {
      productId: string;
      url: string;
      imagePath: string;
      alt: string;
      order: number;
      isPrimary: boolean;
    }[] = [];

    for (let i = 0; i < 3; i++) {
      const uploaded = await uploadPlaceholder(p.id, p.name, i);
      rows.push({
        productId: p.id,
        url: uploaded.url,
        imagePath: uploaded.path,
        alt: i === 0 ? p.name : `${p.name} view ${i + 1}`,
        order: i,
        isPrimary: i === 0,
      });
    }

    await db.insert(productImages).values(rows);
    await db.update(products).set({ thumbnailUrl: rows[0].url }).where(eq(products.id, p.id));
    await db.execute(sql.raw(`UPDATE products SET updated_at = now() WHERE id = '${p.id}'`));
    console.log(`  ✅ ${p.name} -> ${rows[0].url}`);
  }

  console.log("Reseed complete!");
}

reseed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Reseed failed:", err);
    process.exit(1);
  });
