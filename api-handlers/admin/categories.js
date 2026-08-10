import sql from "../_lib/db.js";
import { requireAdmin } from "../_lib/auth.js";
import { ok, created, fail } from "../_lib/respond.js";

/** Slugify a category name → unique URL-safe slug. */
function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function isUniqueViolation(err) {
  return err && (err.code === "23505" || /duplicate key/i.test(err.message || ""));
}

const CATEGORY_SELECT = `
  c.id, c.name, c.slug, c.description, c.image, c.parent_id AS "parentId",
  c.created_at AS "createdAt", c.updated_at AS "updatedAt",
  count(p.id)::int AS count
`;
const CATEGORY_FROM = `
  FROM categories c
  LEFT JOIN products p ON p.category_id = c.id AND p.deleted_at IS NULL
`;

/**
 * GET  /api/admin/categories — admin list with live product counts.
 * POST /api/admin/categories — create a category (name required; slug auto).
 */
export default requireAdmin(async (req, res) => {
  if (req.method === "GET") {
    try {
      const data = await sql.unsafe(`SELECT ${CATEGORY_SELECT} ${CATEGORY_FROM} GROUP BY c.id ORDER BY c.name`);
      return ok(res, data);
    } catch (err) {
      console.error("[admin] categories list failed:", err);
      return fail(res, 500, "Failed to load categories");
    }
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const name = String(body.name || "").trim();
    if (!name) return fail(res, 400, "Category name is required");

    const baseSlug = slugify(name);
    if (!baseSlug) return fail(res, 400, "Category name must contain letters or numbers");

    try {
      // Ensure uniqueness: append -2, -3… until the slug is free.
      let slug = baseSlug;
      let suffix = 1;
      for (;;) {
        const existing = await sql.unsafe("SELECT id FROM categories WHERE slug = $1 LIMIT 1", [slug]);
        if (!existing[0]) break;
        suffix += 1;
        slug = `${baseSlug}-${suffix}`;
      }

      const description = body.description ? String(body.description).trim() : null;
      const rows = await sql.unsafe(
        `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING id`,
        [name, slug, description],
      );
      const createdCategory = await sql.unsafe(
        `SELECT ${CATEGORY_SELECT} ${CATEGORY_FROM} WHERE c.id = $1 GROUP BY c.id`,
        [rows[0].id],
      );
      return created(res, createdCategory[0], "Category created");
    } catch (err) {
      if (isUniqueViolation(err)) return fail(res, 409, "A category with this slug already exists");
      console.error("[admin] category create failed:", err);
      return fail(res, 500, err instanceof Error ? err.message : "Failed to create category");
    }
  }

  return res.status(405).end();
});
