import sql from "../../_lib/db.js";
import { ok, fail } from "../../_lib/respond.js";

/**
 * GET /api/cart/summary/:userId — count + subtotal for navbar/profile widgets
 * (mirrors the old Hono route; the current frontend computes this client-side,
 * kept for API parity).
 */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const userId = req.query.userId;

  try {
    const cartRows = await sql.unsafe("SELECT id FROM carts WHERE user_id = $1 LIMIT 1", [userId]);
    const cart = cartRows[0];
    if (!cart) return ok(res, { count: 0, subtotal: 0, items: [] });

    const items = await sql.unsafe(
      `SELECT ci.quantity, p.price, p.discount_price AS "discountPrice"
       FROM cart_items ci LEFT JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1`,
      [cart.id],
    );
    const count = items.reduce((sum, it) => sum + it.quantity, 0);
    const subtotal = items.reduce(
      (sum, it) => sum + Number(it.discountPrice || it.price) * it.quantity,
      0,
    );
    return ok(res, { count, subtotal, items });
  } catch (err) {
    console.error("[cart] summary failed:", err);
    return fail(res, 500, "Failed to fetch cart summary");
  }
}
