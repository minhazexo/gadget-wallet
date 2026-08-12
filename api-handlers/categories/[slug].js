import sql from "../_lib/db.js";
import { okPublic, fail } from "../_lib/respond.js";

/** GET /api/categories/:slug */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const rows = await sql.unsafe(
      `SELECT id, name, slug, description, image, parent_id AS "parentId",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM categories WHERE slug = $1 LIMIT 1`,
      [req.query.slug],
    );
    if (!rows[0]) return okPublic(res, null, 300, "Category not found");
    return okPublic(res, rows[0], 300);
  } catch (err) {
    console.error("[categories] detail failed:", err);
    return fail(res, 500, "Failed to fetch category");
  }
}
