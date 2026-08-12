import sql from "../_lib/db.js";
import { okPublic, fail } from "../_lib/respond.js";
import { PRODUCT_LIST_SELECT, PRODUCT_FROM } from "../_lib/products.js";

/** GET /api/products/featured — the homepage hero grid. */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const data = await sql.unsafe(
      `SELECT ${PRODUCT_LIST_SELECT} ${PRODUCT_FROM} WHERE p.is_featured = true AND p.deleted_at IS NULL LIMIT 8`,
    );
    return okPublic(res, data, 300);
  } catch (err) {
    console.error("[products] featured failed:", err);
    return fail(res, 500, "Failed to fetch products");
  }
}
