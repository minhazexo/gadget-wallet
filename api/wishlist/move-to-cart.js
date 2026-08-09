import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/** POST /api/wishlist/move-to-cart { productId } — moves item and adds qty 1 to cart. */
export default requireAuth(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const { productId } = req.body || {};
  if (!productId) return fail(res, 400, "productId is required");

  try {
    await sql.unsafe("DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2", [
      req.user.id,
      productId,
    ]);

    let rows = await sql.unsafe("SELECT id FROM carts WHERE user_id = $1 LIMIT 1", [req.user.id]);
    let cart = rows[0];
    if (!cart) {
      rows = await sql.unsafe("INSERT INTO carts (user_id) VALUES ($1) RETURNING id", [req.user.id]);
      cart = rows[0];
    }

    const existing = await sql.unsafe(
      "SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2 LIMIT 1",
      [cart.id, productId],
    );
    if (existing[0]) {
      await sql.unsafe("UPDATE cart_items SET quantity = $1 WHERE id = $2", [
        existing[0].quantity + 1,
        existing[0].id,
      ]);
    } else {
      await sql.unsafe("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, 1)", [
        cart.id,
        productId,
      ]);
    }
    return ok(res, null, "Moved to cart");
  } catch (err) {
    console.error("[wishlist] move-to-cart failed:", err);
    return fail(res, 500, "Failed to move item to cart");
  }
});
