import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/**
 * GET /api/reviews/user — the current user's reviews enriched with product
 * info (name, slug, image), matching the old Hono route shape.
 */
export default requireAuth(async (req, res) => {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const reviews = await sql.unsafe(
      `SELECT r.id, r.rating, r.title, r.comment, r.is_approved AS "isApproved",
              r.created_at AS "createdAt", r.product_id AS "productId",
              p.name AS "productName", p.slug AS "productSlug",
              (SELECT pi.url FROM product_images pi
                WHERE pi.product_id = p.id ORDER BY pi."order" ASC LIMIT 1) AS "productImage"
       FROM reviews r
       LEFT JOIN products p ON p.id = r.product_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id],
    );
    return ok(res, reviews);
  } catch (err) {
    console.error("[reviews] user list failed:", err);
    return fail(res, 500, "Failed to fetch reviews");
  }
});
