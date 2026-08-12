import sql from "../_lib/db.js";
import { okPublic, fail } from "../_lib/respond.js";
import { PRODUCT_SELECT, PRODUCT_FROM, IMAGE_SELECT, SPEC_SELECT } from "../_lib/products.js";

/**
 * GET /api/products/:key — the frontend navigates by slug
 * (/product/:slug), while the guide's example URL uses a numeric id.
 * Match either (id or slug) so both work.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const key = req.query.id;

  try {
    // Cast p.id::text so a single param works against both the text slug and
    // the uuid id columns (PG otherwise errors: operator does not exist uuid = text).
    const rows = await sql.unsafe(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} WHERE (p.slug = $1 OR p.id::text = $1) AND p.deleted_at IS NULL LIMIT 1`,
      [key],
    );
    const product = rows[0];
    if (!product) return fail(res, 404, "Product not found");

    const [images, specs] = await Promise.all([
      sql.unsafe(
        `SELECT ${IMAGE_SELECT} FROM product_images WHERE product_id = $1 ORDER BY "order"`,
        [product.id],
      ),
      sql.unsafe(`SELECT ${SPEC_SELECT} FROM product_specs WHERE product_id = $1`, [product.id]),
    ]);

    // Products only change when an admin edits them — cache per-product at the CDN.
    return okPublic(res, { ...product, images, specs }, 300);
  } catch (err) {
    console.error("[products] detail failed:", err);
    return fail(res, 500, "Failed to fetch product");
  }
}
