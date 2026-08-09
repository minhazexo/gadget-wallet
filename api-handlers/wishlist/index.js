import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

const WISHLIST_SELECT = `
  w.id, w.product_id AS "productId", w.created_at AS "createdAt",
  p.name, p.slug, p.price, p.discount_price AS "discountPrice",
  p.stock, p.rating, p.review_count AS "reviewCount",
  (SELECT pi.url FROM product_images pi
    WHERE pi.product_id = p.id ORDER BY pi."order" ASC LIMIT 1) AS image
`;

/** GET /api/wishlist — current user's wishlist (JWT). */
export default requireAuth(async (req, res) => {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const items = await sql.unsafe(
      `SELECT ${WISHLIST_SELECT} FROM wishlists w
       LEFT JOIN products p ON p.id = w.product_id
       WHERE w.user_id = $1`,
      [req.user.id],
    );
    return ok(res, items);
  } catch (err) {
    console.error("[wishlist] list failed:", err);
    return fail(res, 500, "Failed to fetch wishlist");
  }
});
