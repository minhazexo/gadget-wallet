import sql from "../_lib/db.js";
import { ok, fail } from "../_lib/respond.js";

/** PATCH /api/cart/update { productId, quantity, sessionId?|userId? } */
export default async function handler(req, res) {
  if (req.method !== "PATCH") return res.status(405).end();

  const { productId, quantity, sessionId, userId } = req.body || {};
  if (!productId || !Number.isInteger(quantity) || quantity < 1) {
    return fail(res, 400, "productId and a quantity of at least 1 are required");
  }
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

    await sql.unsafe(
      "UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3",
      [quantity, cart.id, productId],
    );
    return ok(res, null, "Cart updated");
  } catch (err) {
    console.error("[cart] update failed:", err);
    return fail(res, 500, "Failed to update cart");
  }
}
