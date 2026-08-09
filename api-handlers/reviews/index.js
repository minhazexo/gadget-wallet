import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

const REVIEW_SELECT = `
  id, product_id AS "productId", user_id AS "userId", rating, title, comment,
  is_approved AS "isApproved", created_at AS "createdAt"
`;

/** POST /api/reviews { productId, rating, title, comment } */
export default requireAuth(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const { productId, rating, title, comment } = req.body || {};
  if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return fail(res, 400, "productId and a rating between 1 and 5 are required");
  }
  if (!title || String(title).length < 2) {
    return fail(res, 400, "Title must be at least 2 characters");
  }
  if (!comment || String(comment).length < 5) {
    return fail(res, 400, "Comment must be at least 5 characters");
  }

  try {
    const rows = await sql.unsafe(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${REVIEW_SELECT}`,
      [productId, req.user.id, rating, String(title), String(comment)],
    );
    return ok(res, rows[0], "Review submitted");
  } catch (err) {
    console.error("[reviews] create failed:", err);
    return fail(res, 500, "Failed to submit review");
  }
});
