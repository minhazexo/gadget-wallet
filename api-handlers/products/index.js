import sql from "../_lib/db.js";
import { okPublic, fail } from "../_lib/respond.js";
import { PRODUCT_LIST_SELECT, PRODUCT_FROM } from "../_lib/products.js";

const UUID_RE = /^[0-9a-fA-F-]{36}$/;

/** Whitelisted sort keys — ORDER BY fragments never accept raw user input. */
const SORTS = {
  newest: "p.created_at DESC",
  "price-asc": "COALESCE(p.discount_price, p.price)::numeric ASC",
  "price-desc": "COALESCE(p.discount_price, p.price)::numeric DESC",
  rating: "p.rating::numeric DESC, p.review_count DESC",
  discount: "(COALESCE(p.discount_price, p.price)::numeric / NULLIF(p.price::numeric, 0)) ASC",
  popular: "p.review_count DESC, p.rating::numeric DESC",
};

const toList = (value) =>
  (Array.isArray(value) ? value : [value])
    .filter(Boolean)
    .flatMap((part) => part.split(","))
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * GET /api/products?page=&limit=&category=&brand=&search=&sale=
 *   &brands=&colors=&minPrice=&maxPrice=&minRating=&discount=&inStock=&sort=
 *
 * Filters (all optional, AND-ed):
 *   brands   — comma-separated and/or repeated brand slugs or ids (multi-select)
 *   colors   — comma-separated and/or repeated color names (product specs, case-insensitive)
 *   minPrice / maxPrice — effective (selling) price bounds
 *   minRating — minimum rating (e.g. 4 = 4.0 and up)
 *   discount — "1"/"true" → only products with an active discount
 *   inStock  — "1"/"true" → only products with stock > 0
 *   sort     — newest | price-asc | price-desc | rating | discount | popular
 *
 * Response includes a `facets` object (brands + colors + price range, scoped
 * to the current category) so the storefront sidebar can render without extra
 * round-trips.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
  const category = req.query.category || "";
  const search = req.query.search || "";
  const sale = req.query.sale === "1" || req.query.sale === "true";
  const discount = sale || req.query.discount === "1" || req.query.discount === "true";
  const inStock = req.query.inStock === "1" || req.query.inStock === "true";
  const minPrice = parseFloat(req.query.minPrice);
  const maxPrice = parseFloat(req.query.maxPrice);
  const minRating = parseFloat(req.query.minRating);
  const sort = SORTS[req.query.sort] ? req.query.sort : "newest";

  const brands = toList(req.query.brands || req.query.brand);
  const colors = toList(req.query.colors);

  // Resolve slugs to ids (like the old route) so /category/:slug works.
  let categoryId = category;
  if (category && !UUID_RE.test(category)) {
    const rows = await sql.unsafe("SELECT id FROM categories WHERE slug = $1 LIMIT 1", [category]);
    categoryId = rows[0]?.id || null;
  }

  // brands may mix slugs and ids — resolve the slugs in one round-trip.
  let brandIds = brands;
  const slugBrands = brands.filter((b) => !UUID_RE.test(b));
  if (slugBrands.length > 0) {
    const rows = await sql.unsafe("SELECT id, slug FROM brands WHERE slug = ANY($1::text[])", [
      slugBrands,
    ]);
    const bySlug = Object.fromEntries(rows.map((r) => [r.slug, r.id]));
    brandIds = brands
      .map((b) => (UUID_RE.test(b) ? b : bySlug[b] || ""))
      .filter(Boolean);
  }

  const conditions = ["p.deleted_at IS NULL"];
  const params = [];
  const add = (cond, val) => {
    params.push(val);
    // Function replacer → the `$` in `$n` is inserted verbatim (String.replace
    // would otherwise reinterpret `$n` as a capture-group substitution).
    conditions.push(cond.replace("?", () => `$${params.length}`));
  };

  if (categoryId) add("p.category_id = ?", categoryId);
  if (brandIds.length > 0) add("p.brand_id = ANY(?::uuid[])", brandIds);
  if (colors.length > 0)
    add(
      "p.id IN (SELECT ps.product_id FROM product_specs ps WHERE lower(ps.key) = 'color' AND lower(ps.value) = ANY(?::text[]))",
      colors.map((c) => c.toLowerCase()),
    );
  if (search) add("p.name ILIKE ?", `%${search}%`);
  if (!Number.isNaN(minPrice)) add("COALESCE(p.discount_price, p.price)::numeric >= ?", minPrice);
  if (!Number.isNaN(maxPrice)) add("COALESCE(p.discount_price, p.price)::numeric <= ?", maxPrice);
  if (!Number.isNaN(minRating)) add("p.rating::numeric >= ?", minRating);
  if (discount) conditions.push("p.discount_price IS NOT NULL");
  if (inStock) conditions.push("p.stock > 0");

  const where = conditions.join(" AND ");
  const offset = (page - 1) * limit;

  // Facet scope = category only, so sidebar options stay meaningful while the
  // user narrows down inside the category.
  const scope = ["p.deleted_at IS NULL"];
  const scopeParams = [];
  const addScope = (cond, val) => {
    scopeParams.push(val);
    scope.push(cond.replace("?", () => `$${scopeParams.length}`));
  };
  if (categoryId) addScope("p.category_id = ?", categoryId);
  const scopeWhere = scope.join(" AND ");

  try {
    // Data + total in ONE query via a window function — the neon() driver is
    // HTTP-based, so every separate statement is its own round-trip to Neon.
    // count(*) OVER() is computed before LIMIT/OFFSET apply, so _total on the
    // first row is the full filtered count.
    const rows = await sql.unsafe(
      `SELECT ${PRODUCT_LIST_SELECT},
              count(*) OVER()::int AS _total
         ${PRODUCT_FROM} WHERE ${where} ORDER BY ${SORTS[sort]} LIMIT ${limit} OFFSET ${offset}`,
      params,
    );
    const total = rows.length > 0 ? Number(rows[0]._total || 0) : 0;

    const [brandFacet, colorFacet, priceFacet] = await Promise.all([
      sql.unsafe(
        `SELECT b.slug, b.name, count(*)::int AS count
           FROM products p
           JOIN brands b ON b.id = p.brand_id
          WHERE ${scopeWhere}
          GROUP BY b.slug, b.name
          ORDER BY count DESC`,
        scopeParams,
      ),
      sql.unsafe(
        `SELECT ps.value AS name, count(*)::int AS count
           FROM products p
           JOIN product_specs ps ON ps.product_id = p.id AND lower(ps.key) = 'color'
          WHERE ${scopeWhere}
          GROUP BY ps.value
          ORDER BY count DESC`,
        scopeParams,
      ),
      sql.unsafe(
        `SELECT min(COALESCE(p.discount_price, p.price)::numeric)::float AS min,
                max(COALESCE(p.discount_price, p.price)::numeric)::float AS max
           FROM products p
          WHERE ${scopeWhere}`,
        scopeParams,
      ),
    ]);

    // okPublic wraps in { success, data, message }, so pass the bare payload.
    return okPublic(res, {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      facets: {
        brands: brandFacet,
        colors: colorFacet,
        priceRange:
          priceFacet[0] && priceFacet[0].min != null
            ? { min: priceFacet[0].min, max: priceFacet[0].max }
            : { min: 0, max: 0 },
      },
    }, 60);
  } catch (err) {
    console.error("[products] list failed:", err);
    return fail(res, 500, "Failed to fetch products");
  }
}
