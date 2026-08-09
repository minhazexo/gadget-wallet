import sql from "../_lib/db.js";
import { paginated, fail } from "../_lib/respond.js";
import { PRODUCT_SELECT, PRODUCT_FROM } from "../_lib/products.js";

const UUID_RE = /^[0-9a-fA-F-]{36}$/;

/**
 * GET /api/products?page=&limit=&category=&brand=&search=
 * Mirrors the old Hono products route: category/brand accept a slug OR id.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
  const category = req.query.category || "";
  const brand = req.query.brand || "";
  const search = req.query.search || "";
  // ?sale=1 → only products with an active discount (homepage Flash Sale section).
  const sale = req.query.sale === "1" || req.query.sale === "true";

  // Resolve slugs to ids (like the old route) so /category/:slug works.
  let categoryId = category;
  if (category && !UUID_RE.test(category)) {
    const rows = await sql.unsafe("SELECT id FROM categories WHERE slug = $1 LIMIT 1", [category]);
    categoryId = rows[0]?.id || null;
  }
  let brandId = brand;
  if (brand && !UUID_RE.test(brand)) {
    const rows = await sql.unsafe("SELECT id FROM brands WHERE slug = $1 LIMIT 1", [brand]);
    brandId = rows[0]?.id || null;
  }

  const conditions = ["p.deleted_at IS NULL"];
  const params = [];
  const add = (cond, val) => {
    params.push(val);
    conditions.push(cond.replace("?", `$${params.length}`));
  };

  if (categoryId) add("p.category_id = ?", categoryId);
  if (brandId) add("p.brand_id = ?", brandId);
  if (search) add("p.name ILIKE ?", `%${search}%`);
  if (sale) conditions.push("p.discount_price IS NOT NULL");

  const where = conditions.join(" AND ");
  const offset = (page - 1) * limit;

  try {
    const data = await sql.unsafe(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} WHERE ${where} ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params,
    );
    const countRows = await sql.unsafe(
      `SELECT count(*)::int AS count ${PRODUCT_FROM} WHERE ${where}`,
      params,
    );
    const total = Number(countRows[0]?.count || 0);
    return paginated(res, data, total, page, limit);
  } catch (err) {
    console.error("[products] list failed:", err);
    return fail(res, 500, "Failed to fetch products");
  }
}
