import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/** DELETE /api/wishlist/remove { productId } */
export default requireAuth(async (req, res) => {
  if (req.method !== "DELETE") return res.status(405).end();
  const { productId } = req.body || {};
  if (!productId) return fail(res, 400, "productId is required");

  try {
    await sql.unsafe("DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2", [
      req.user.id,
      productId,
    ]);
    return ok(res, null, "Removed from wishlist");
  } catch (err) {
    console.error("[wishlist] remove failed:", err);
    return fail(res, 500, "Failed to remove from wishlist");
  }
});
