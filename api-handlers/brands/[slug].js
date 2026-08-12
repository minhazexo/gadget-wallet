import sql from "../_lib/db.js";
import { okPublic, fail } from "../_lib/respond.js";

/** GET /api/brands/:slug */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const rows = await sql.unsafe(
      `SELECT id, name, slug, logo, description, created_at AS "createdAt" FROM brands WHERE slug = $1 LIMIT 1`,
      [req.query.slug],
    );
    if (!rows[0]) return okPublic(res, null, 300, "Brand not found");
    return okPublic(res, rows[0], 300);
  } catch (err) {
    console.error("[brands] detail failed:", err);
    return fail(res, 500, "Failed to fetch brand");
  }
}
