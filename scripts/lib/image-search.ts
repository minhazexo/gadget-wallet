/**
 * Image search providers for the product-photo fetcher.
 *
 * Returns candidate image URLs for a query. Providers are tried in order:
 *   1. Google Images (tbm=isch) — best-effort; many networks (and bots) get
 *      a JS-only shell or a 302 consent redirect, in which case it yields []
 *      and the caller falls through to Bing.
 *   2. Bing Images — the reliable workhorse. Direct media URLs (`murl`) are
 *      embedded in the HTML `iusc` blocks and are usually downloadable.
 *   3. DuckDuckGo — JSON endpoint fallback (needs a vqd token from the page).
 *
 * Results are raw search hits — quality filtering (resolution, white
 * background) happens later in the downloader, not here.
 */
export interface ImageCandidate {
  url: string;
  /** Optional small thumbnail of the same image (Bing CDN) — last-resort fallback. */
  thumbUrl?: string;
  width?: number;
  height?: number;
  source: "google" | "bing" | "duckduckgo";
}

export type ImageProvider = "google" | "bing" | "duckduckgo";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

async function httpGet(url: string, extraHeaders: Record<string, string> = {}) {
  return fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      ...extraHeaders,
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function isHttpUrl(u: string): boolean {
  return /^https?:\/\//i.test(u);
}

function dedupe(items: ImageCandidate[]): ImageCandidate[] {
  const seen = new Set<string>();
  const out: ImageCandidate[] = [];
  for (const it of items) {
    // Normalise away query strings for dedupe but keep the full URL to fetch.
    let host = "";
    try {
      host = new URL(it.url).host;
    } catch {
      continue;
    }
    const key = `${host}${it.url.split("?")[0]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

/**
 * Google Images — parses `/imgres?imgurl=` links and any embedded full-size
 * image URLs. Often returns [] from automated environments.
 */
export async function searchGoogleImages(query: string): Promise<ImageCandidate[]> {
  try {
    const url = `https://www.google.com/search?tbm=isch&hl=en&gl=us&q=${encodeURIComponent(query)}`;
    const res = await httpGet(url, {
      // Consent cookies: without them Google 302s to a consent wall on most IPs.
      Cookie:
        "CONSENT=YES+cb.20220301-11-p0.en+FX+417; SOCS=CAESHAgBEhJnd3NfMjAyMzA0MTItMF9SQzIaAmVuIAEaBgiA_LyaBg",
    });
    if (!res.ok) return [];
    const html = await res.text();
    const out: ImageCandidate[] = [];

    for (const m of html.matchAll(/\/imgres\?imgurl=([^&"]+)/g)) {
      try {
        const u = decodeURIComponent(m[1]);
        if (isHttpUrl(u)) out.push({ url: u, source: "google" });
      } catch {
        /* skip malformed */
      }
    }
    if (out.length === 0) {
      // Fallback: any embedded full-size image-looking URL.
      for (const m of html.matchAll(/https:\\?\/\\?\/[^"\\\s]+?\.(?:jpe?g|png|webp)(?:\\?\/[^"\\\s]*)?/gi)) {
        const u = m[0].replace(/\\\//g, "/");
        if (isHttpUrl(u)) out.push({ url: u, source: "google" });
      }
    }
    return dedupe(out);
  } catch {
    return [];
  }
}

/**
 * Bing Images — extracts direct media URLs (`murl`) and thumbnails (`turl`)
 * from the `iusc` result blocks in the HTML.
 */
export async function searchBingImages(query: string): Promise<ImageCandidate[]> {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2`;
    const res = await httpGet(url);
    if (!res.ok) return [];
    const html = await res.text();

    const media: string[] = [];
    for (const m of html.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)) {
      const u = decodeHtmlEntities(m[1]);
      if (isHttpUrl(u)) media.push(u);
    }
    const thumbs: string[] = [];
    for (const m of html.matchAll(/turl&quot;:&quot;(.*?)&quot;/g)) {
      const u = decodeHtmlEntities(m[1]);
      if (isHttpUrl(u)) thumbs.push(u);
    }

    // Pair each media URL with the corresponding thumbnail (same index order
    // in Bing's result blocks) so hotlink-protected images can fall back to
    // the Bing CDN thumbnail.
    const out = media.map((u, i) => ({ url: u, thumbUrl: thumbs[i], source: "bing" as const }));
    return dedupe(out);
  } catch {
    return [];
  }
}

/**
 * DuckDuckGo — JSON image endpoint. Needs the per-query vqd token scraped
 * from the search page first. Best-effort; returns [] if blocked.
 */
export async function searchDuckDuckGoImages(query: string): Promise<ImageCandidate[]> {
  try {
    const pageUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
    const pageRes = await httpGet(pageUrl);
    if (!pageRes.ok) return [];
    const html = await pageRes.text();
    const vqd = html.match(/vqd='([^']+)'/)?.[1] ?? html.match(/vqd="([^"]+)"/)?.[1];
    if (!vqd) return [];

    const jsonUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,&p=1`;
    const jsonRes = await httpGet(jsonUrl, { "X-Requested-With": "XMLHttpRequest" });
    if (!jsonRes.ok) return [];
    const data = (await jsonRes.json()) as { results?: { image?: string; width?: number; height?: number }[] };
    const out = (data.results || [])
      .filter((r) => r.image && isHttpUrl(r.image))
      .map((r) => ({
        url: r.image!,
        width: r.width,
        height: r.height,
        source: "duckduckgo" as const,
      }));
    return dedupe(out);
  } catch {
    return [];
  }
}

/** Runs the requested providers in order and concatenates the candidates. */
export async function searchImages(query: string, provider: ImageProvider | "all" = "all"): Promise<ImageCandidate[]> {
  const wanted = new Set(provider === "all" ? (["google", "bing", "duckduckgo"] as ImageProvider[]) : [provider]);
  const results: ImageCandidate[] = [];

  if (wanted.has("google")) {
    const g = await searchGoogleImages(query);
    if (g.length) {
      results.push(...g);
      return results; // google is authoritative when it works — no need for more
    }
  }
  if (wanted.has("bing")) results.push(...(await searchBingImages(query)));
  if (wanted.has("duckduckgo")) results.push(...(await searchDuckDuckGoImages(query)));

  return dedupe(results);
}
