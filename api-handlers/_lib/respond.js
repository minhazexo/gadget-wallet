// Response shapes match the old Hono helpers (apps/server/src/utils/response.ts)
// so the existing frontend keeps working unchanged.

export function ok(res, data, message) {
  return res.status(200).json({ success: true, data, message });
}

/**
 * Public, read-only GET responses — cacheable at Vercel's edge CDN.
 * `s-maxage` caches at the CDN (repeat visitors never hit the function or
 * Neon), `stale-while-revalidate` keeps serving stale while revalidating
 * in the background so the first request after a TTL expiry is still fast.
 * Never use this for auth/cart/wishlist/orders/admin endpoints.
 */
export function okPublic(res, data, ttl = 300, message) {
  res.setHeader(
    "Cache-Control",
    `public, s-maxage=${ttl}, stale-while-revalidate=${Math.max(30, Math.floor(ttl / 3))}`,
  );
  return ok(res, data, message);
}

export function created(res, data, message) {
  return res.status(201).json({ success: true, data, message });
}

export function fail(res, status, error) {
  return res.status(status).json({ success: false, error });
}

export function paginated(res, data, total, page, limit) {
  return res.status(200).json({
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
