import sql from "../_lib/db.js";
import { ok, fail } from "../_lib/respond.js";

/** POST /api/cart/add { productId, quantity, sessionId?|userId? } */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { productId, quantity, sessionId, userId } = req.body || {};
  if (!productId || !Number.isInteger(quantity) || quantity < 1) {
    return fail(res, 400, "productId and a quantity of at least 1 are required");
  }
  if (!userId && !sessionId) {
    return fail(res, 400, "Either userId or sessionId is required");
  }

  try {
    let rows = await sql.unsafe(
      userId
        ? "SELECT id FROM carts WHERE user_id = $1 LIMIT 1"
        : "SELECT id FROM carts WHERE session_id = $1 LIMIT 1",
      [userId || sessionId],
    );
    let cart = rows[0];
    if (!cart) {
      rows = await sql.unsafe(
        userId
          ? "INSERT INTO carts (user_id) VALUES ($1) RETURNING id"
          : "INSERT INTO carts (session_id) VALUES ($1) RETURNING id",
        [userId || sessionId],
      );
      cart = rows[0];
    }

    const existing = await sql.unsafe(
      "SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2 LIMIT 1",
      [cart.id, productId],
    );
    if (existing[0]) {
      await sql.unsafe("UPDATE cart_items SET quantity = $1 WHERE id = $2", [
        existing[0].quantity + quantity,
        existing[0].id,
      ]);
    } else {
      await sql.unsafe(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
        [cart.id, productId, quantity],
      );
    }
    return ok(res, null, "Item added to cart");
  } catch (err) {
    console.error("[cart] add failed:", err);
    return fail(res, 500, "Failed to add item to cart");
  }
}
