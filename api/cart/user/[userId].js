import sql from "../../_lib/db.js";
import { ok, fail } from "../../_lib/respond.js";

const CART_ITEM_SELECT = `
  ci.id, ci.product_id AS "productId", ci.quantity,
  p.name, p.slug, p.price, p.discount_price AS "discountPrice", p.stock,
  (SELECT pi.url FROM product_images pi
    WHERE pi.product_id = p.id ORDER BY pi."order" ASC LIMIT 1) AS image
`;

/** GET /api/cart/user/:userId — logged-in user's cart (returns { cart, items }). */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const userId = req.query.userId;

  try {
    const cartRows = await sql.unsafe("SELECT id FROM carts WHERE user_id = $1 LIMIT 1", [userId]);
    const cart = cartRows[0];
    if (!cart) return ok(res, { cart: null, items: [] });

    const items = await sql.unsafe(
      `SELECT ${CART_ITEM_SELECT} FROM cart_items ci
       LEFT JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1`,
      [cart.id],
    );
    return ok(res, { cart, items });
  } catch (err) {
    console.error("[cart] user cart failed:", err);
    return fail(res, 500, "Failed to fetch cart");
  }
}
