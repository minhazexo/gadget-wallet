import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

const REVIEW_SELECT = `
  id, product_id AS "productId", user_id AS "userId", rating, title, comment,
  is_approved AS "isApproved", created_at AS "createdAt"
`;

/** PUT /api/reviews/:id (partial) and DELETE /api/reviews/:id — ownership enforced. */
export default requireAuth(async (req, res) => {
  const id = req.query.id;
  if (!id) return fail(res, 400, "Review id is required");

  try {
    const existing = await sql.unsafe(
      "SELECT id FROM reviews WHERE id = $1 AND user_id = $2 LIMIT 1",
      [id, req.user.id],
    );
    if (!existing[0]) return fail(res, 404, "Review not found");

    if (req.method === "PUT") {
      const { rating, title, comment } = req.body || {};
      const sets = [];
      const params = [];
      const push = (col, val) => {
        params.push(val);
        sets.push(`${col} = $${params.length}`);
      };
      if (rating !== undefined) {
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          return fail(res, 400, "Rating must be between 1 and 5");
        }
        push("rating", rating);
      }
      if (title !== undefined) {
        if (String(title).length < 2) return fail(res, 400, "Title must be at least 2 characters");
        push("title", String(title));
      }
      if (comment !== undefined) {
        if (String(comment).length < 5) return fail(res, 400, "Comment must be at least 5 characters");
        push("comment", String(comment));
      }
      if (sets.length === 0) return fail(res, 400, "Nothing to update");

      params.push(id);
      const rows = await sql.unsafe(
        `UPDATE reviews SET ${sets.join(", ")} WHERE id = $${params.length}
         RETURNING ${REVIEW_SELECT}`,
        params,
      );
      return ok(res, rows[0], "Review updated successfully");
    }

    if (req.method === "DELETE") {
      await sql.unsafe("DELETE FROM reviews WHERE id = $1", [id]);
      return ok(res, null, "Review deleted successfully");
    }

    return res.status(405).end();
  } catch (err) {
    console.error("[reviews] operation failed:", err);
    return fail(res, 500, "Failed to update review");
  }
});
