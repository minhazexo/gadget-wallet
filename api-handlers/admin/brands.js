import sql from "../_lib/db.js";
import { requireAdmin } from "../_lib/auth.js";
import { ok, created, fail } from "../_lib/respond.js";

/** Slugify a brand name → unique URL-safe slug (mirrors category behaviour). */
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

/**
 * GET  /api/admin/brands — full list with live product counts.
 * POST /api/admin/brands — create a brand (name required; slug auto-generated).
 */
export default requireAdmin(async (req, res) => {
  if (req.method === "GET") {
    try {
      const data = await sql.unsafe(`
        SELECT b.id, b.name, b.slug, b.logo, b.description,
               b.created_at AS "createdAt",
               count(p.id)::int AS count
        FROM brands b
        LEFT JOIN products p ON p.brand_id = b.id AND p.deleted_at IS NULL
        GROUP BY b.id
        ORDER BY b.name
      `);
      return ok(res, data);
    } catch (err) {
      console.error("[admin] brands list failed:", err);
      return fail(res, 500, "Failed to load brands");
    }
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const name = String(body.name || "").trim();
    if (!name) return fail(res, 400, "Brand name is required");

    const baseSlug = slugify(name);
    if (!baseSlug) return fail(res, 400, "Brand name must contain letters or numbers");

    try {
      // Ensure uniqueness: append -2, -3… until the slug is free.
      let slug = baseSlug;
      let suffix = 1;
      for (;;) {
        const existing = await sql.unsafe("SELECT id FROM brands WHERE slug = $1 LIMIT 1", [slug]);
        if (!existing[0]) break;
        suffix += 1;
        slug = `${baseSlug}-${suffix}`;
      }

      const description = body.description ? String(body.description).trim() : null;
      const rows = await sql.unsafe(
        `INSERT INTO brands (name, slug, description) VALUES ($1, $2, $3) RETURNING id`,
        [name, slug, description],
      );
      const brand = rows[0];
      const createdBrand = await sql.unsafe(
        `SELECT b.id, b.name, b.slug, b.logo, b.description, b.created_at AS "createdAt",
                count(p.id)::int AS count
         FROM brands b
         LEFT JOIN products p ON p.brand_id = b.id AND p.deleted_at IS NULL
         WHERE b.id = $1
         GROUP BY b.id`,
        [brand.id],
      );
      return created(res, createdBrand[0], "Brand created");
    } catch (err) {
      if (isUniqueViolation(err)) return fail(res, 409, "A brand with this slug already exists");
      console.error("[admin] brand create failed:", err);
      return fail(res, 500, err instanceof Error ? err.message : "Failed to create brand");
    }
  }

  return res.status(405).end();
});
