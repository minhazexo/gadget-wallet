import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

const RECENTLY_VIEWED_SELECT = `
  rv.id, rv.product_id AS "productId", rv.viewed_at AS "viewedAt",
  p.name, p.slug, p.price, p.discount_price AS "discountPrice", p.stock,
  (SELECT pi.url FROM product_images pi
    WHERE pi.product_id = p.id ORDER BY pi."order" ASC LIMIT 1) AS image
`;

/** GET /api/recently-viewed (latest 12) and POST /api/recently-viewed { productId }. */
export default requireAuth(async (req, res) => {
  if (req.method === "GET") {
    try {
      const items = await sql.unsafe(
        `SELECT ${RECENTLY_VIEWED_SELECT} FROM recently_viewed rv
         LEFT JOIN products p ON p.id = rv.product_id
         WHERE rv.user_id = $1
         ORDER BY rv.viewed_at DESC LIMIT 12`,
        [req.user.id],
      );
      return ok(res, items);
    } catch (err) {
      console.error("[recently-viewed] list failed:", err);
      return fail(res, 500, "Failed to fetch recently viewed");
    }
  }

  if (req.method === "POST") {
    const { productId } = req.body || {};
    if (!productId) return fail(res, 400, "productId is required");

    try {
      const existing = await sql.unsafe(
        "SELECT id FROM recently_viewed WHERE user_id = $1 AND product_id = $2 LIMIT 1",
        [req.user.id, productId],
      );
      if (existing[0]) {
        await sql.unsafe("UPDATE recently_viewed SET viewed_at = NOW() WHERE id = $1", [existing[0].id]);
      } else {
        await sql.unsafe("INSERT INTO recently_viewed (user_id, product_id) VALUES ($1, $2)", [
          req.user.id,
          productId,
        ]);
      }

      // Trim to the most recent 12.
      const older = await sql.unsafe(
        "SELECT id FROM recently_viewed WHERE user_id = $1 ORDER BY viewed_at DESC OFFSET 12",
        [req.user.id],
      );
      for (const row of older) {
        await sql.unsafe("DELETE FROM recently_viewed WHERE id = $1", [row.id]);
      }
      return ok(res, null, "Added to recently viewed");
    } catch (err) {
      console.error("[recently-viewed] add failed:", err);
      return fail(res, 500, "Failed to add to recently viewed");
    }
  }

  return res.status(405).end();
});
