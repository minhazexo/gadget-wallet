import api from "./api";

interface CacheEntry {
  expiresAt: number;
  data: unknown;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * GET with a small in-memory cache for PUBLIC, read-only endpoints
 * (categories, brands, featured, new-arrivals, product lists).
 *
 * - Concurrent callers for the same URL share one in-flight request (dedup).
 * - Repeat mounts within `ttlMs` resolve from memory — no network round-trip.
 * - Never use for auth/cart/wishlist/orders/admin data.
 */
export function cachedGet<T = unknown>(url: string, ttlMs = 60_000): Promise<T> {
  const hit = cache.get(url);
  if (hit && hit.expiresAt > Date.now()) {
    return Promise.resolve(hit.data as T);
  }

  const pending = inflight.get(url);
  if (pending) return pending as Promise<T>;

  const promise = api
    .get<T>(url)
    .then((res) => {
      cache.set(url, { expiresAt: Date.now() + ttlMs, data: res.data });
      return res.data;
    })
    .finally(() => {
      inflight.delete(url);
    });

  inflight.set(url, promise);
  return promise;
}

/** Drop cached entries (e.g. after an admin edit) — pass a URL to clear one. */
export function clearCachedGet(url?: string) {
  if (url) cache.delete(url);
  else cache.clear();
}
