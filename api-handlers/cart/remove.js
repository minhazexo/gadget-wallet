import sql from "../_lib/db.js";
import { ok, fail } from "../_lib/respond.js";

/** DELETE /api/cart/remove { productId, sessionId?|userId? } */
export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  const { productId, sessionId, userId } = req.body || {};
  if (!productId) return fail(res, 400, "productId is required");
  if (!userId && !sessionId) {
    return fail(res, 400, "Either userId or sessionId is required");
  }

  try {
    const rows = await sql.unsafe(
      userId
        ? "SELECT id FROM carts WHERE user_id = $1 LIMIT 1"
        : "SELECT id FROM carts WHERE session_id = $1 LIMIT 1",
      [userId || sessionId],
    );
    const cart = rows[0];
    if (!cart) return fail(res, 404, "Cart not found");

    await sql.unsafe("DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2", [
      cart.id,
      productId,
    ]);
    return ok(res, null, "Item removed from cart");
  } catch (err) {
    console.error("[cart] remove failed:", err);
    return fail(res, 500, "Failed to remove item from cart");
  }
}
