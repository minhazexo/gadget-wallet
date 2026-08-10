import sql from "../../_lib/db.js";
import { requireAdmin } from "../../_lib/auth.js";
import { ok, fail } from "../../_lib/respond.js";
import { deleteImage } from "../../_lib/supabase.js";

const BRAND_SELECT = `
  b.id, b.name, b.slug, b.logo, b.description, b.created_at AS "createdAt",
  count(p.id)::int AS count
`;

/**
 * PATCH  /api/admin/brands/:id — update name and/or description.
 *        Slug is read-only so storefront brand URLs stay stable.
 * DELETE /api/admin/brands/:id — deletes the brand, its logo file and the
 *        DB row. Blocked with 409 while any product still references it.
 */
export default requireAdmin(async (req, res) => {
  const id = req.query.id;

  if (req.method === "PATCH") {
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
        `UPDATE brands SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING id`,
        params,
      );
      if (!rows[0]) return fail(res, 404, "Brand not found");

      const updated = await sql.unsafe(
        `SELECT ${BRAND_SELECT}
         FROM brands b
         LEFT JOIN products p ON p.brand_id = b.id AND p.deleted_at IS NULL
         WHERE b.id = $1
         GROUP BY b.id`,
        [id],
      );
      return ok(res, updated[0], "Brand updated");
    } catch (err) {
      console.error("[admin] brand update failed:", err);
      return fail(res, 500, err instanceof Error ? err.message : "Failed to update brand");
    }
  }

  if (req.method === "DELETE") {
    try {
      const brand = await sql.unsafe("SELECT id, logo FROM brands WHERE id = $1 LIMIT 1", [id]);
      if (!brand[0]) return fail(res, 404, "Brand not found");

      const [countRow] = await sql.unsafe(
        "SELECT count(*)::int AS count FROM products WHERE brand_id = $1 AND deleted_at IS NULL",
        [id],
      );
      if (Number(countRow?.count || 0) > 0) {
        return fail(res, 409, `Cannot delete — ${countRow.count} product(s) still use this brand. Reassign them first.`);
      }

      // Remove the logo file first (best effort), then the DB row.
      if (brand[0].logo) await deleteImage(brand[0].logo).catch(() => {});
      await sql.unsafe("DELETE FROM brands WHERE id = $1", [id]);

      return ok(res, null, "Brand deleted");
    } catch (err) {
      console.error("[admin] brand delete failed:", err);
      return fail(res, 500, "Failed to delete brand");
    }
  }

  return res.status(405).end();
});
