import sql from "../_lib/db.js";
import { okPublic, fail } from "../_lib/respond.js";

/** GET /api/brands */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const data = await sql.unsafe(
      `SELECT id, name, slug, logo, description, created_at AS "createdAt" FROM brands ORDER BY name`,
    );
    return okPublic(res, data, 300);
  } catch (err) {
    console.error("[brands] list failed:", err);
    return fail(res, 500, "Failed to fetch brands");
  }
}
