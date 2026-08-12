import sql from "../../_lib/db.js";
import { ok, fail } from "../../_lib/respond.js";
import { PRODUCT_SELECT, PRODUCT_FROM, IMAGE_SELECT, SPEC_SELECT } from "../../_lib/products.js";

/**
 * GET /api/products/by-id/:id — the Checkout "Buy Now" flow fetches a product
 * by its id (the plain /products/:key route matches slug OR id, but buy-now
 * explicitly passes an id so it never collides with a slug).
 */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const id = req.query.id;

  try {
    const rows = await sql.unsafe(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} WHERE p.id = $1 AND p.deleted_at IS NULL LIMIT 1`,
      [id],
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

    return okPublic(res, { ...product, images, specs }, 300);
  } catch (err) {
    console.error("[products] by-id failed:", err);
    return fail(res, 500, "Failed to fetch product");
  }
}
