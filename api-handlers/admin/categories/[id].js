import sql from "../../_lib/db.js";
import { requireAdmin } from "../../_lib/auth.js";
import { ok, fail } from "../../_lib/respond.js";

/**
 * PATCH /api/admin/categories/:id — update name and/or description.
 * Slug is intentionally read-only: category URLs (storefront pages, header
 * menu, homepage chips, banners) all depend on it staying stable.
 */
export default requireAdmin(async (req, res) => {
  if (req.method !== "PATCH") return res.status(405).end();
  const id = req.query.id;
  const body = req.body || {};

  try {
    const sets = [];
    const params = [];
    const push = (col, val) => {
      params.push(val);
      sets.push(`${col} = $${params.length}`);
    };

    if (body.name !== undefined && String(body.name).trim()) push("name", String(body.name).trim());
    if (body.description !== undefined) push("description", body.description ? String(body.description).trim() : null);

    if (sets.length === 0) return fail(res, 400, "Nothing to update");

    params.push(id);
    const rows = await sql.unsafe(
      `UPDATE categories SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${params.length} RETURNING id`,
      params,
    );
    if (!rows[0]) return fail(res, 404, "Category not found");

    const updated = await sql.unsafe(
      `SELECT id, name, slug, description, image, parent_id AS "parentId",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM categories WHERE id = $1 LIMIT 1`,
      [id],
    );
    return ok(res, updated[0], "Category updated");
  } catch (err) {
    console.error("[admin] category update failed:", err);
    return fail(res, 500, err instanceof Error ? err.message : "Failed to update category");
  }
});
