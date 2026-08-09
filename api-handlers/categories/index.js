import sql from "../_lib/db.js";
import { ok, fail } from "../_lib/respond.js";

/** GET /api/categories — with a per-category product count (counts live products). */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const data = await sql.unsafe(`
      SELECT c.id, c.name, c.slug, c.description, c.image, c.parent_id AS "parentId",
             count(p.id)::int AS count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.deleted_at IS NULL
      GROUP BY c.id, c.name, c.slug, c.description, c.image, c.parent_id
      ORDER BY c.name
    `);
    return ok(res, data);
  } catch (err) {
    console.error("[categories] list failed:", err);
    return fail(res, 500, "Failed to fetch categories");
  }
}
