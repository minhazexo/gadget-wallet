import sql from "../_lib/db.js";
import { ok, fail } from "../_lib/respond.js";

/** POST /api/cart/merge { sessionId, userId } — merge guest cart into user cart. */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { sessionId, userId } = req.body || {};
  if (!sessionId || !userId) {
    return fail(res, 400, "sessionId and userId are required");
  }

  try {
    const guestRows = await sql.unsafe("SELECT id FROM carts WHERE session_id = $1 LIMIT 1", [sessionId]);
    const guestCart = guestRows[0];

    let userRows = await sql.unsafe("SELECT id FROM carts WHERE user_id = $1 LIMIT 1", [userId]);
    let userCart = userRows[0];
    if (!userCart) {
      userRows = await sql.unsafe("INSERT INTO carts (user_id) VALUES ($1) RETURNING id", [userId]);
      userCart = userRows[0];
    }

    if (guestCart && guestCart.id !== userCart.id) {
      const guestItems = await sql.unsafe(
        "SELECT product_id AS \"productId\", quantity FROM cart_items WHERE cart_id = $1",
        [guestCart.id],
      );
      for (const item of guestItems) {
        const existing = await sql.unsafe(
          "SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2 LIMIT 1",
          [userCart.id, item.productId],
        );
        if (existing[0]) {
          await sql.unsafe("UPDATE cart_items SET quantity = $1 WHERE id = $2", [
            existing[0].quantity + item.quantity,
            existing[0].id,
          ]);
        } else {
          await sql.unsafe(
            "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
            [userCart.id, item.productId, item.quantity],
          );
        }
      }
      await sql.unsafe("DELETE FROM cart_items WHERE cart_id = $1", [guestCart.id]);
      await sql.unsafe("DELETE FROM carts WHERE id = $1", [guestCart.id]);
    }
    return ok(res, null, "Cart merged successfully");
  } catch (err) {
    console.error("[cart] merge failed:", err);
    return fail(res, 500, "Failed to merge cart");
  }
}
