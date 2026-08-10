#!/usr/bin/env bun
/**
 * GadgetWallet professional-store upgrade backfill.
 *
 * Part 1 — 3 images per product:
 *   Every product currently has exactly one photo. This generates two extra
 *   views from that photo (a zoomed detail crop and an angled presentation
 *   with a soft shadow) via sharp, uploads them to Supabase
 *   (products/{productId}/gallery-{2,3}.webp) and inserts product_images
 *   rows so the storefront gallery shows 3 thumbnails.
 *
 * Part 2 — brand logos:
 *   Generates a clean wordmark logo tile for every brand (white card, brand
 *   colour accent, centred name), uploads it to products/brands/{brandId}/
 *   and sets brands.logo, so the homepage Top Brands section shows
 *   professional logo cards instead of initials.
 *
 * Usage: bun run scripts/backfill-gallery-logos.ts
 *        bun run scripts/backfill-gallery-logos.ts --products-only
 *        bun run scripts/backfill-gallery-logos.ts --logos-only
 *        bun run scripts/backfill-gallery-logos.ts --slug redmi-buds-5
 *        bun run scripts/backfill-gallery-logos.ts --force
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { eq, isNull } from "drizzle-orm";
import { db, schema } from "../packages/db/src/index.js";

const BUCKET = "products";
const TARGET = 1200;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

if (!supabase) {
  console.error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

let sharp: typeof import("sharp").default;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("sharp is required — run: bun add -d sharp");
  process.exit(1);
}

const args = process.argv.slice(2);
const productsOnly = args.includes("--products-only");
const logosOnly = args.includes("--logos-only");
const slugFilter = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;
const force = args.includes("--force");

// ─── helpers ─────────────────────────────────────────────────────

function publicUrl(storagePath: string) {
  return supabase!.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

async function upload(storagePath: string, buffer: Buffer, contentType: string) {
  const { error } = await supabase!.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`upload failed for ${storagePath}: ${error.message}`);
  return publicUrl(storagePath);
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ─── Part 1: gallery images ──────────────────────────────────────

async function ensureGalleryImages(productId: string, name: string) {
  const existing = await db
    .select({ id: schema.productImages.id, order: schema.productImages.order })
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, productId))
    .orderBy(schema.productImages.order);

  const current = existing.filter((i) => i.order < 2); // orders 0 and 1
  if (current.length >= 2 && !force) return { status: "skipped" };

  // Base image: the primary (cover) photo.
  const [primary] = await db
    .select({ url: schema.productImages.url })
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, productId))
    .orderBy(schema.productImages.order)
    .limit(1);
  if (!primary) return { status: "no-image" };

  const base = await download(primary.url);
  const meta = await sharp(base, { failOn: "none" }).metadata();
  const width = meta.width ?? 800;
  const height = meta.height ?? 800;

  // Variant 2 — zoomed detail: crop 55% of the canvas from the centre,
  // then letterbox back to the target square.
  const zoom = await sharp(base, { failOn: "none" })
    .resize(TARGET, TARGET, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .extract({
      left: Math.floor(width * 0.22),
      top: Math.floor(height * 0.22),
      width: Math.floor(width * 0.56),
      height: Math.floor(height * 0.56),
    })
    .resize(TARGET, TARGET, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 82 })
    .toBuffer();

  // Variant 3 — angled presentation: slight rotation + soft shadow on white.
  const rotated = await sharp(base, { failOn: "none" })
    .resize(TARGET, TARGET, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .rotate(-4, { background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: "#ffffff" })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${TARGET}" height="${TARGET}"><rect x="0" y="0" width="${TARGET}" height="${TARGET}" fill="rgba(0,0,0,0.05)" rx="24"/></svg>`,
        ),
        top: 0,
        left: 0,
        blend: "over",
      },
    ])
    .webp({ quality: 82 })
    .toBuffer();

  // Record order 0 (cover, keep existing isPrimary) — only add orders 1 & 2.
  const nextOrder = 1;
  const variants: { order: number; buffer: Buffer; suffix: string }[] = [
    { order: nextOrder, buffer: zoom, suffix: "2" },
    { order: nextOrder + 1, buffer: rotated, suffix: "3" },
  ];

  for (const v of variants) {
    const storagePath = `${BUCKET}/${productId}/gallery-${v.suffix}.webp`;
    const url = await upload(storagePath, v.buffer, "image/webp");
    const existingRow = existing.find((i) => i.order === v.order);
    if (existingRow) {
      await db
        .update(schema.productImages)
        .set({ url, imagePath: storagePath, alt: `${name} — view ${v.suffix}` })
        .where(eq(schema.productImages.id, existingRow.id));
    } else {
      await db.insert(schema.productImages).values({
        productId,
        url,
        imagePath: storagePath,
        alt: `${name} — view ${v.suffix}`,
        order: v.order,
        isPrimary: false,
      });
    }
  }

  return { status: "ok" };
}

// ─── Part 2: brand logos ─────────────────────────────────────────

const BRAND_COLORS: Record<string, string> = {
  xiaomi: "#ff6900",
  redmi: "#ff6700",
  realme: "#ffc300",
  baseus: "#0ea5e9",
  hoco: "#e11d2e",
  joyroom: "#111827",
  samsung: "#1428a0",
  anker: "#00a9e0",
  ugreen: "#3c5899",
  oraimo: "#16a34a",
  qcy: "#2563eb",
  soundcore: "#0f172a",
  haylou: "#3b82f6",
  kieslect: "#7c3aed",
  amazfit: "#0d9488",
  generic: "#64748b",
};

function logoSvg(name: string, color: string): string {
  const font = Math.max(44, Math.min(88, Math.floor(760 / Math.max(1, name.length))));
  return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" rx="28" fill="#ffffff"/>
  <rect x="0" y="0" width="400" height="10" fill="${color}"/>
  <text x="200" y="216" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${font}" font-weight="800" fill="#111827" text-anchor="middle" dominant-baseline="middle">${name}</text>
  <circle cx="200" cy="330" r="6" fill="${color}"/>
</svg>`;
}

async function ensureBrandLogo(brandId: string, name: string, slug: string) {
  const [brand] = await db
    .select({ logo: schema.brands.logo })
    .from(schema.brands)
    .where(eq(schema.brands.id, brandId))
    .limit(1);
  if (brand?.logo && !force) return { status: "skipped" };

  const color = BRAND_COLORS[slug] ?? "#64748b";
  const svg = Buffer.from(logoSvg(name, color));
  const webp = await sharp(svg, { failOn: "none" }).webp({ quality: 88 }).toBuffer();

  const storagePath = `${BUCKET}/brands/${brandId}/logo.webp`;
  const url = await upload(storagePath, webp, "image/webp");
  await db.update(schema.brands).set({ logo: url }).where(eq(schema.brands.id, brandId));
  return { status: "ok", url };
}

// ─── main ────────────────────────────────────────────────────────

let products = await db.select().from(schema.products).where(isNull(schema.products.deletedAt));
if (slugFilter) products = products.filter((p) => p.slug === slugFilter);

if (!logosOnly) {
  console.log(`\n── Gallery images (${products.length} products) ──`);
  let ok = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    process.stdout.write(`  [${i + 1}/${products.length}] ${p.name} ... `);
    try {
      const res = await ensureGalleryImages(p.id, p.name);
      console.log(res.status === "ok" ? "✅ 3 images" : `— ${res.status}`);
      if (res.status === "ok") ok++;
    } catch (err) {
      console.log(`— error (${(err as Error).message})`);
    }
  }
  console.log(`Gallery done: ${ok} updated.`);
}

if (!productsOnly) {
  console.log(`\n── Brand logos ──`);
  const brands = await db.select().from(schema.brands).orderBy(schema.brands.name);
  let ok = 0;
  for (let i = 0; i < brands.length; i++) {
    const b = brands[i];
    process.stdout.write(`  [${i + 1}/${brands.length}] ${b.name} ... `);
    try {
      const res = await ensureBrandLogo(b.id, b.name, b.slug);
      console.log(res.status === "ok" ? `✅ ${res.url}` : `— ${res.status}`);
      if (res.status === "ok") ok++;
    } catch (err) {
      console.log(`— error (${(err as Error).message})`);
    }
  }
  console.log(`Logos done: ${ok} updated.`);
}

console.log("\nDone.");
process.exit(0);
