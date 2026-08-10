#!/usr/bin/env bun
/**
 * GadgetWallet automated product-photo fetcher.
 *
 * For every catalog product it:
 *   1. Searches image search engines for official product photos (the same
 *      queries as docs/GadgetWallet_60_Product_Image_Search_Links.md).
 *   2. Downloads candidate images, validates them (real image bytes, min
 *      resolution) and prefers white-background product shots.
 *   3. Converts the chosen image to WEBP at 1200×1200 (white background,
 *      quality 82) via sharp.
 *   4. Saves it locally as assets/product-images/{category}/{slug}.webp
 *      (slug = the filename from the image search-links doc).
 *   5. Uploads it to Supabase (public `product-images` bucket, upsert).
 *   6. Updates the Neon database (product_images.url/image_path +
 *      products.thumbnail_url).
 *
 * Usage:
 *   bun run scripts/fetch-product-images.ts                  # all 60 products
 *   bun run scripts/fetch-product-images.ts --slug baseus-bipow-10000mah
 *   bun run scripts/fetch-product-images.ts --limit 5
 *   bun run scripts/fetch-product-images.ts --provider bing --delay 2000
 *   bun run scripts/fetch-product-images.ts --save-only      # no Supabase/DB
 *   bun run scripts/fetch-product-images.ts --force          # re-fetch existing
 *   bun run scripts/fetch-product-images.ts --no-convert     # keep original format
 *
 * Resumable: products whose target file already exists are skipped unless
 * --force is passed. Be polite — the script rate-limits itself, but search
 * engines may still throttle long runs; if that happens, re-run and it will
 * continue where it left off.
 *
 * Note: product photos found via image search are typically copyrighted
 * material owned by the brand/retailer. Use this only for products you are
 * authorised to sell, and double-check each downloaded image before launch.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS, type CatalogProduct } from "../packages/db/src/catalog-bangladesh.js";
import { searchImages, type ImageCandidate, type ImageProvider } from "./lib/image-search.js";
import { uploadProductImage, isSupabaseConfigured } from "./lib/upload.js";

const ASSETS_DIR = join(process.cwd(), "assets", "product-images");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
const TARGET_SIZE = 1200;
const WEBP_QUALITY = 82;

// ─── Flags ───────────────────────────────────────────────────────

interface Options {
  limit: number;
  slug: string | null;
  force: boolean;
  saveOnly: boolean;
  noConvert: boolean;
  preferWhite: boolean;
  allowThumbs: boolean;
  provider: ImageProvider | "all";
  delay: number;
  maxAttempts: number;
  minDim: number;
}

function parseFlags(): Options {
  const opts: Options = {
    limit: Infinity,
    slug: null,
    force: false,
    saveOnly: false,
    noConvert: false,
    preferWhite: true,
    allowThumbs: true,
    provider: "all",
    delay: 1200,
    maxAttempts: 6,
    minDim: 400,
  };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const next = () => (i < args.length ? args[++i] : undefined);
    switch (a) {
      case "--limit":
        {
          const v = parseInt(next() || "0", 10);
          opts.limit = v > 0 ? v : Infinity;
        }
        break;
      case "--slug": opts.slug = next() || null; break;
      case "--force": opts.force = true; break;
      case "--save-only": opts.saveOnly = true; break;
      case "--no-convert": opts.noConvert = true; break;
      case "--no-white-check": opts.preferWhite = false; break;
      case "--no-thumbs": opts.allowThumbs = false; break;
      case "--provider":
        {
          const p = next();
          if (p && ["google", "bing", "duckduckgo", "all"].includes(p)) opts.provider = p as ImageProvider | "all";
          else console.warn(`Unknown provider "${p}" — using all`);
        }
        break;
      case "--delay": opts.delay = parseInt(next() || "1200", 10) || 0; break;
      case "--max-attempts": opts.maxAttempts = parseInt(next() || "6", 10) || 1; break;
      case "--min-dim": opts.minDim = parseInt(next() || "400", 10) || 100; break;
      case "--help":
      case "-h":
        console.log(`
Usage: bun run scripts/fetch-product-images.ts [options]

  --slug <slug>          Only fetch one product (slug = filename minus .webp)
  --limit <n>            Only fetch the first n products
  --force                Re-fetch products that already have a saved image
  --provider <engine>    google | bing | duckduckgo | all (default all)
  --save-only            Download + save locally, skip Supabase/DB updates
  --no-convert           Keep the original image format (no WebP conversion)
  --no-white-check       Skip the white-background preference
  --no-thumbs            Don't fall back to small Bing CDN thumbnails
  --delay <ms>           Politeness delay between products (default 1200)
  --max-attempts <n>     Max candidate downloads per product (default 6)
  --min-dim <px>         Minimum image edge (default 400)
`);
        process.exit(0);
      default:
        console.error(`Unknown flag: ${a}`);
        process.exit(1);
    }
  }
  return opts;
}

// ─── sharp helpers (graceful when unavailable) ───────────────────

let sharpPromise: Promise<typeof import("sharp").default | null> | null = null;
function loadSharp(): Promise<typeof import("sharp").default | null> {
  if (!sharpPromise) {
    sharpPromise = import("sharp")
      .then((m) => m.default)
      .catch(() => null);
  }
  return sharpPromise;
}

function sniffImageType(buf: Buffer): string | null {
  if (buf.length < 16) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf.toString("ascii", 1, 4) === "PNG") return "image/png";
  if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.toString("ascii", 0, 4) === "GIF8") return "image/gif";
  if (buf.slice(0, 2).toString("ascii") === "BM") return "image/bmp";
  return null;
}

async function imageDimensions(buf: Buffer): Promise<{ width: number; height: number } | null> {
  const sharp = await loadSharp();
  if (!sharp) return null;
  try {
    const meta = await sharp(buf, { failOn: "none" }).metadata();
    return meta.width && meta.height ? { width: meta.width, height: meta.height } : null;
  } catch {
    return null;
  }
}

/**
 * True when all sampled edge/corner pixels are near-white. Corners that are
 * fully transparent (alpha ≈ 0 — common for product PNGs, which look white on
 * a white card) count as white.
 */
async function isWhiteBackground(buf: Buffer): Promise<boolean | null> {
  const sharp = await loadSharp();
  if (!sharp) return null;
  try {
    const { data, info } = await sharp(buf, { failOn: "none" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;
    if (!width || !height || width < 50 || height < 50) return null;
    const px = (x: number, y: number) => {
      const i = (Math.min(y, height - 1) * width + Math.min(x, width - 1)) * channels;
      return [data[i], data[i + 1], data[i + 2], channels >= 4 ? data[i + 3] : 255];
    };
    const samples: [number, number][] = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
      [Math.floor(width / 2), 0],
      [Math.floor(width / 2), height - 1],
      [0, Math.floor(height / 2)],
      [width - 1, Math.floor(height / 2)],
    ];
    return samples.every(([x, y]) => {
      const [r, g, b, a] = px(x, y);
      if (a < 25) return true; // transparent corner ≈ white background
      return r >= 238 && g >= 238 && b >= 238;
    });
  } catch {
    return null;
  }
}

async function toWebp(buf: Buffer): Promise<Buffer> {
  const sharp = await loadSharp();
  if (!sharp) throw new Error("sharp unavailable");
  return sharp(buf, { failOn: "none" })
    .rotate()
    .resize(TARGET_SIZE, TARGET_SIZE, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      // Don't upscale small sources (e.g. Bing CDN thumbnails) into soft images.
      withoutEnlargement: true,
    })
    .flatten({ background: "#ffffff" })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

// ─── Download ────────────────────────────────────────────────────

async function downloadImage(url: string, referer: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
        Referer: referer,
      },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2000) return null;
    if (!sniffImageType(buf)) return null;
    return buf;
  } catch {
    return null;
  }
}

interface DownloadResult {
  buffer: Buffer;
  url: string;
  width?: number;
  height?: number;
  whiteBg: boolean | null;
  source: string;
}

/** Tries candidates until a good one is found; prefers white backgrounds. */
async function pickImage(candidates: ImageCandidate[], opts: Options): Promise<DownloadResult | null> {
  const referer = "https://www.bing.com/";
  let bestValid: DownloadResult | null = null;
  let attempts = 0;

  for (const cand of candidates) {
    if (attempts >= opts.maxAttempts) break;
    attempts++;

    const buf = await downloadImage(cand.url, referer);
    if (!buf) {
      // Hotlink-protected? Try the small Bing CDN thumbnail as last resort.
      if (opts.allowThumbs && cand.thumbUrl && attempts < opts.maxAttempts) {
        const thumb = await downloadImage(cand.thumbUrl, referer);
        if (thumb) {
          attempts++;
          const dims = await imageDimensions(thumb);
          if (!dims || dims.width < opts.minDim || dims.height < opts.minDim) continue;
          return { buffer: thumb, url: cand.thumbUrl, ...dims, whiteBg: false, source: `${cand.source}/thumb` };
        }
      }
      continue;
    }

    const dims = await imageDimensions(buf);
    if (dims && (dims.width < opts.minDim || dims.height < opts.minDim)) continue;

    const whiteBg = opts.preferWhite ? await isWhiteBackground(buf) : null;
    const result: DownloadResult = {
      buffer: buf,
      url: cand.url,
      width: dims?.width,
      height: dims?.height,
      whiteBg,
      source: cand.source,
    };

    if (!bestValid) bestValid = result;
    if (whiteBg === true) return result; // exactly what we want
  }

  return bestValid;
}

// ─── Orchestration ───────────────────────────────────────────────

async function processProduct(p: CatalogProduct, opts: Options): Promise<{ status: string; note?: string; viaThumb?: boolean }> {
  const dir = join(ASSETS_DIR, p.categorySlug);
  const dest = join(dir, p.imageFile);
  if (existsSync(dest) && !opts.force) {
    return { status: "skipped", note: "already saved (use --force to re-fetch)" };
  }

  const query = p.name; // matches the image search-links doc
  const candidates = await searchImages(query, opts.provider);
  if (candidates.length === 0) return { status: "no-results", note: query };

  const picked = await pickImage(candidates, opts);
  if (!picked) return { status: "download-failed", note: query };

  // Convert to WEBP unless disabled.
  let outBuffer: Buffer = picked.buffer;
  let contentType = sniffImageType(picked.buffer) || "image/jpeg";
  let converted = false;
  if (!opts.noConvert) {
    try {
      outBuffer = await toWebp(picked.buffer);
      contentType = "image/webp";
      converted = true;
    } catch {
      /* keep original */
    }
  }

  // Save locally (resume marker + keeps a copy of every photo).
  mkdirSync(dir, { recursive: true });
  writeFileSync(dest, outBuffer);

  // Upload + update DB unless --save-only (config is checked up front in main()).
  let url = "";
  if (!opts.saveOnly) {
    url = await uploadProductImage(p.categorySlug, p.imageFile, outBuffer, contentType);
  }

  const white = picked.whiteBg === true ? "white-bg" : picked.whiteBg === false ? "colored-bg" : "bg-unknown";
  const viaThumb = picked.source.includes("thumb");
  return {
    status: "ok",
    note: `${picked.width ?? "?"}x${picked.height ?? "?"} ${white} ${converted ? "webp" : "as-is"} via ${picked.source}${url ? ` → ${url}` : ""}`,
    viaThumb,
  };
}

async function main() {
  const opts = parseFlags();

  if (!opts.saveOnly && !isSupabaseConfigured()) {
    console.error(
      "Supabase is not configured (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY). " +
        "Run with --save-only to just download and save locally.",
    );
    process.exit(1);
  }

  let targets = PRODUCTS;
  if (opts.slug) {
    targets = PRODUCTS.filter((p) => p.imageFile.replace(/\.(webp|jpe?g|png)$/i, "") === opts.slug);
    if (targets.length === 0) {
      console.error(`No product matches slug "${opts.slug}"`);
      process.exit(1);
    }
  } else if (Number.isFinite(opts.limit)) {
    targets = PRODUCTS.slice(0, opts.limit);
  }

  console.log(
    `Fetching photos for ${targets.length} product(s) | provider=${opts.provider} delay=${opts.delay}ms ` +
      `white-check=${opts.preferWhite} convert=${!opts.noConvert} upload=${!opts.saveOnly}`,
  );

  const summary = { ok: 0, skipped: 0, noResults: 0, downloadFailed: 0, errors: 0 };
  const viaThumb: string[] = [];
  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];
    process.stdout.write(`[${i + 1}/${targets.length}] ${p.name} ... `);
    try {
      const res = await processProduct(p, opts);
      console.log(res.status === "ok" ? `✅ ${res.note}` : `— ${res.status} (${res.note ?? ""})`);
      if (res.status === "ok") {
        summary.ok++;
        if (res.viaThumb) viaThumb.push(p.name);
      } else if (res.status === "skipped") summary.skipped++;
      else if (res.status === "no-results") summary.noResults++;
      else if (res.status === "download-failed") summary.downloadFailed++;
      else summary.errors++;
    } catch (err) {
      console.log(`— error (${(err as Error).message})`);
      summary.errors++;
    }
    if (i < targets.length - 1 && opts.delay > 0) {
      await new Promise((r) => setTimeout(r, opts.delay));
    }
  }

  console.log(
    `\nDone: ${summary.ok} ok, ${summary.skipped} skipped, ${summary.noResults} no results, ` +
      `${summary.downloadFailed} download failed, ${summary.errors} errors.`,
  );
  console.log(`Saved under ${ASSETS_DIR}/`);
  if (!opts.saveOnly) console.log("Supabase + Neon updated. Run with --save-only to skip uploads next time.");
  if (viaThumb.length > 0) {
    console.warn(
      `\n⚠ ${viaThumb.length} product(s) used a low-res Bing thumbnail (original was hotlink-protected):\n  ` +
        viaThumb.join("\n  ") +
        "\nCheck them on the storefront; re-run with --force later to retry a full-size photo.",
    );
  }
  process.exit(summary.errors + summary.downloadFailed + summary.noResults > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fetcher failed:", err);
  process.exit(1);
});
