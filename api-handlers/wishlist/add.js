import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/** POST /api/wishlist/add { productId } */
export default requireAuth(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const { productId } = req.body || {};
  if (!productId) return fail(res, 400, "productId is required");

  try {
    const existing = await sql.unsafe(
      "SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2 LIMIT 1",
      [req.user.id, productId],
    );
    if (existing[0]) return ok(res, null, "Already in wishlist");

    await sql.unsafe("INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)", [
      req.user.id,
      productId,
    ]);
    return ok(res, null, "Added to wishlist");
  } catch (err) {
    console.error("[wishlist] add failed:", err);
    return fail(res, 500, "Failed to add to wishlist");
  }
});
