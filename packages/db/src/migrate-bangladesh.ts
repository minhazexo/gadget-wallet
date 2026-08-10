/**
 * GadgetWallet → Bangladesh catalog migration (docs/GadgetWallet_Bangladesh_Product_Migration_Guide.md).
 *
 * - Deletes all existing product data (products, images, specs, reviews,
 *   wishlists, cart items, recently-viewed, order items) and the old
 *   categories/brands.
 * - Inserts exactly the six target categories and the 60-product catalog.
 * - Creates the Supabase `product-images` bucket (public) with per-category
 *   folders and uploads a branded placeholder image per product using the
 *   filenames from docs/GadgetWallet_60_Product_Image_Search_Links.md.
 * - Saves public URLs in product_images + thumbnail_url, marks 2 featured per
 *   category, adds warranty/SEO/delivery specs, and updates settings/banners.
 *
 * Data only — application logic is untouched.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { eq, sql } from "drizzle-orm";
import { db } from "./index.js";
import {
  banners,
  brands,
  categories,
  productImages,
  productSpecs,
  products,
  settings,
} from "./schema.js";
import {
  BRANDS,
  CATEGORIES,
  PRODUCTS,
  slugFor,
  type CatalogProduct,
} from "./catalog-bangladesh.js";

const BUCKET = "product-images";

export const DELIVERY_NOTE = [
  "Delivery inside Dhaka: 24-48 hours",
  "Delivery outside Dhaka: 2-5 days",
  "Cash on Delivery available",
  "Easy return within 7 days for manufacturing defects",
].join("\n");

const CATEGORY_EMOJI: Record<string, string> = {
  earphone: "🎧",
  "power-bank": "🔋",
  "usb-cable": "🔌",
  "glass-protector": "🛡️",
  earbuds: "🎵",
  "smart-watch": "⌚",
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Branded white-background placeholder (spec §8: white bg, square). */
function placeholderSvg(p: CatalogProduct, brandName: string): string {
  const emoji = CATEGORY_EMOJI[p.categorySlug] || "📦";
  const name = esc(p.name);
  const footer = esc(`${brandName} · Gadget Wallet`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <rect width="1200" height="1200" fill="#ffffff"/>
  <circle cx="600" cy="520" r="360" fill="#f4f6fb"/>
  <text x="600" y="560" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif" font-size="230" text-anchor="middle">${emoji}</text>
  <text x="600" y="800" font-family="Inter, Arial, sans-serif" font-size="52" font-weight="700" fill="#0b1220" text-anchor="middle">${name}</text>
  <text x="600" y="872" font-family="Inter, Arial, sans-serif" font-size="34" fill="#64748b" text-anchor="middle">${footer}</text>
</svg>`;
}

function buildFullDescription(p: CatalogProduct, brandName: string, categoryName: string): string {
  const specs = [
    { key: "Brand", value: brandName },
    { key: "Category", value: categoryName },
    { key: "Model", value: p.model },
    ...p.specs,
    ...(p.color ? [{ key: "Color", value: p.color }] : []),
    { key: "Warranty", value: "6 Months Brand Warranty" },
    { key: "Condition", value: "Brand New" },
  ];
  const lines = specs.map((s) => `• ${s.key}: ${s.value}`);
  return `${p.name} — ${p.shortDescription}\n\nKey features:\n${p.highlights.map((h) => `• ${h}`).join("\n")}\n\nSpecifications:\n${lines.join("\n")}\n\n${DELIVERY_NOTE}`;
}

function buildSpecs(p: CatalogProduct, brandName: string, categoryName: string) {
  const seoKeywords = `${brandName} ${p.model}, ${p.model} price in Bangladesh, ${categoryName.toLowerCase()} Bangladesh`;
  return [
    { key: "Brand", value: brandName },
    { key: "Category", value: categoryName },
    { key: "Model", value: p.model },
    ...p.specs,
    ...(p.color ? [{ key: "Color", value: p.color }] : []),
    { key: "Warranty", value: "6 Months Brand Warranty" },
    { key: "Condition", value: "Brand New" },
    { key: "Delivery", value: DELIVERY_NOTE },
    { key: "meta_title", value: `${p.name} Price in Bangladesh` },
    { key: "meta_description", value: `Buy ${p.name} at GadgetWallet with official warranty and fast delivery in Bangladesh.` },
    { key: "keywords", value: seoKeywords },
  ];
}

/** Fail fast if the dataset breaks the guide's constraints. */
function validateCatalog() {
  const countByCategory = new Map<string, number>();
  const featuredByCategory = new Map<string, number>();
  const slugs = new Set<string>();
  const skus = new Set<string>();
  const files = new Set<string>();

  for (const p of PRODUCTS) {
    const slug = slugFor(p);
    if (slugs.has(slug)) throw new Error(`Duplicate slug: ${slug}`);
    slugs.add(slug);
    if (skus.has(p.sku)) throw new Error(`Duplicate sku: ${p.sku}`);
    skus.add(p.sku);
    if (files.has(p.imageFile)) throw new Error(`Duplicate imageFile: ${p.imageFile}`);
    files.add(p.imageFile);

    countByCategory.set(p.categorySlug, (countByCategory.get(p.categorySlug) || 0) + 1);
    if (p.isFeatured) featuredByCategory.set(p.categorySlug, (featuredByCategory.get(p.categorySlug) || 0) + 1);
  }

  for (const c of CATEGORIES) {
    const count = countByCategory.get(c.slug) || 0;
    const featured = featuredByCategory.get(c.slug) || 0;
    if (count !== 10) throw new Error(`Category ${c.slug} has ${count} products (expected 10)`);
    if (featured !== 2) throw new Error(`Category ${c.slug} has ${featured} featured (expected 2)`);
  }
  if (PRODUCTS.length !== 60) throw new Error(`Expected 60 products, got ${PRODUCTS.length}`);
}

async function ensureBucket() {
  if (!supabase) throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Failed to create bucket ${BUCKET}: ${error.message}`);
  }
}

export async function migrateBangladeshCatalog(): Promise<void> {
  console.log("Validating catalog dataset...");
  validateCatalog();

  if (!supabase) {
    console.warn("WARNING: Supabase not configured — products will be inserted without images.");
  }

  // ── 1. Wipe old catalog + related rows (FK-safe order, mirrors guide §1) ──
  console.log("Wiping old catalog data...");
  const inserted = await db.transaction(async (tx) => {
    await tx.execute(sql`DELETE FROM product_images`);
    await tx.execute(sql`DELETE FROM product_specs`);
    await tx.execute(sql`DELETE FROM reviews`);
    await tx.execute(sql`DELETE FROM wishlists`);
    await tx.execute(sql`DELETE FROM recently_viewed`);
    await tx.execute(sql`DELETE FROM cart_items`);
    await tx.execute(sql`DELETE FROM order_items`);
    await tx.execute(sql`DELETE FROM products`);
    await tx.execute(sql`DELETE FROM categories`);
    await tx.execute(sql`DELETE FROM brands`);

    // ── 2. Categories + brands ──
    const cats = await tx
      .insert(categories)
      .values(CATEGORIES.map((c) => ({ name: c.name, slug: c.slug, description: c.description })))
      .returning();
    const brds = await tx
      .insert(brands)
      .values(BRANDS.map((b) => ({ name: b.name, slug: b.slug, description: b.description })))
      .returning();
    const catMap = new Map(cats.map((c) => [c.slug, c.id]));
    const brandMap = new Map(brds.map((b) => [b.slug, b.id]));
    const brandName = new Map(brds.map((b) => [b.slug, b.name]));

    // ── 3. Products (created_at staggered: array order = newest last) ──
    const base = Date.now();
    const rows = await tx
      .insert(products)
      .values(
        PRODUCTS.map((p, i) => ({
          name: p.name,
          slug: slugFor(p),
          shortDescription: p.shortDescription,
          fullDescription: buildFullDescription(p, brandName.get(p.brandSlug)!, CATEGORIES.find((c) => c.slug === p.categorySlug)!.name),
          price: String(p.price),
          discountPrice: p.discountPrice != null ? String(p.discountPrice) : null,
          sku: p.sku,
          brandId: brandMap.get(p.brandSlug)!,
          categoryId: catMap.get(p.categorySlug)!,
          stock: p.stock,
          rating: String(p.rating),
          reviewCount: p.reviewCount,
          isFeatured: p.isFeatured,
          isNewArrival: p.isNewArrival,
          isBestSeller: p.isBestSeller,
          createdAt: new Date(base - (PRODUCTS.length - i) * 60_000),
        })),
      )
      .returning();

    // ── 4. Specs (warranty, SEO, delivery — guide §6/§10/§13) ──
    const specRows = rows.flatMap((row) => {
      const p = PRODUCTS.find((x) => x.sku === row.sku)!;
      return buildSpecs(p, brandName.get(p.brandSlug)!, CATEGORIES.find((c) => c.slug === p.categorySlug)!.name).map(
        (s) => ({ productId: row.id, key: s.key, value: s.value }),
      );
    });
    await tx.insert(productSpecs).values(specRows);

    // ── 5. Settings + banners (data, aligned with the new catalog) ──
    await tx.update(settings).set({ value: "BDT" }).where(eq(settings.key, "currency"));
    // BDT free-shipping threshold — matches the storefront copy (On orders ৳2,000+).
    await tx.update(settings).set({ value: "2000" }).where(eq(settings.key, "free_shipping_threshold"));
    await tx
      .update(settings)
      .set({ value: "Premium gadgets store in Bangladesh — earphones, power banks, smart watches and more." })
      .where(eq(settings.key, "site_description"));
    await tx.delete(banners);
    await tx.insert(banners).values([
      {
        title: "Power Bank Collection",
        subtitle: "Fast charging power banks for every phone",
        imageUrl: "https://picsum.photos/seed/power-bank-banner/1200/400",
        linkUrl: "/category/power-bank",
        position: "home",
        isActive: true,
      },
      {
        title: "Earbuds Collection",
        subtitle: "Wireless sound without breaking the bank",
        imageUrl: "https://picsum.photos/seed/earbuds-banner/1200/400",
        linkUrl: "/category/earbuds",
        position: "home",
        isActive: true,
      },
    ]);

    return rows;
  });

  console.log(`Inserted ${inserted.length} products.`);

  // ── 6. Images (outside the transaction — network calls) ──
  let uploaded = 0;
  if (supabase) {
    await ensureBucket();
    for (const row of inserted) {
      const p = PRODUCTS.find((x) => x.sku === row.sku)!;
      const brandName = BRANDS.find((b) => b.slug === p.brandSlug)!.name;
      const storagePath = `${BUCKET}/${p.categorySlug}/${p.imageFile}`;

      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, placeholderSvg(p, brandName), {
        contentType: "image/svg+xml",
        upsert: true,
      });
      if (error) {
        console.error(`  ⚠ failed to upload ${storagePath}: ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

      await db.insert(productImages).values({
        productId: row.id,
        url: data.publicUrl,
        imagePath: storagePath,
        alt: p.name,
        order: 0,
        isPrimary: true,
      });
      await db.update(products).set({ thumbnailUrl: data.publicUrl }).where(eq(products.id, row.id));
      uploaded++;
      console.log(`  ✅ ${p.name} -> ${data.publicUrl}`);
    }
  }

  // ── 7. Summary ──
  const summary = await db
    .select({ name: categories.name, slug: categories.slug, count: sql<number>`count(${products.id})::int` })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.name);
  console.log("\nMigration complete — catalog by category:");
  for (const row of summary) console.log(`  ${row.name} (${row.slug}): ${row.count} products`);
  console.log(`Images uploaded: ${uploaded}/${inserted.length}`);
}

// Run directly when executed: bun run packages/db/src/migrate-bangladesh.ts
if (import.meta.main) {
  migrateBangladeshCatalog()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
