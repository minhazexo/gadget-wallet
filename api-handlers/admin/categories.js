import sql from "../_lib/db.js";
import { requireAdmin } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/** GET /api/admin/categories — admin list with live product counts. */
export default requireAdmin(async (req, res) => {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const data = await sql.unsafe(`
      SELECT c.id, c.name, c.slug, c.description, c.image, c.parent_id AS "parentId",
             c.created_at AS "createdAt", c.updated_at AS "updatedAt",
             count(p.id)::int AS count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.name
    `);
    return ok(res, data);
  } catch (err) {
    console.error("[admin] categories list failed:", err);
    return fail(res, 500, "Failed to load categories");
  }
});
