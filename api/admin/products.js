import sql from "../_lib/db.js";
import { requireAdmin } from "../_lib/auth.js";
import { ok, created, fail } from "../_lib/respond.js";
import { parseMultipart } from "../_lib/multipart.js";
import { uploadImage, deleteImage, isAllowedImage } from "../_lib/supabase.js";
import { PRODUCT_SELECT, PRODUCT_FROM } from "../_lib/products.js";

const MAX_IMAGES_PER_PRODUCT = 12;
const DUPLICATE_MESSAGE = "A product with this slug or SKU already exists";

function isUniqueViolation(err) {
  return err && (err.code === "23505" || /duplicate key/i.test(err.message || ""));
}

function toBool(value) {
  return value === true || value === "true" || value === "1";
}

/**
 * POST /api/admin/products — multipart/form-data (fields + image files).
 * GET /api/admin/products — full product list.
 */
export default requireAdmin(async (req, res) => {
  if (req.method === "GET") {
    try {
      const products = await sql.unsafe(
        `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} WHERE p.deleted_at IS NULL ORDER BY p.created_at DESC`,
      );
      return ok(res, products);
    } catch (err) {
      console.error("[admin] products list failed:", err);
      return fail(res, 500, "Failed to load products");
    }
  }

  if (req.method === "POST") {
    const contentType = (req.headers["content-type"] || "").toLowerCase();
    // Accept multipart/form-data (admin form with images) OR application/json
    // (API clients), mirroring the old Hono route.
    const isMultipart = contentType.includes("multipart/form-data");
    const { fields, files } = isMultipart
      ? await parseMultipart(req)
      : { fields: req.body || {}, files: [] };

    const required = ["name", "slug", "shortDescription", "fullDescription", "price", "sku", "brandId", "categoryId"];
    for (const key of required) {
      if (!fields[key] || !String(fields[key]).trim()) {
        return fail(res, 400, `Missing required field: ${key}`);
      }
    }

    const stock = parseInt(fields.stock || "0", 10);
    const price = String(fields.price);
    const discountPrice = fields.discountPrice ? String(fields.discountPrice) : null;

    const uploadedPaths = [];
    try {
      const createdRows = await sql.unsafe(
        `INSERT INTO products (
           name, slug, short_description, full_description, price, discount_price,
           sku, brand_id, category_id, stock,
           is_featured, is_new_arrival, is_best_seller
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [
          String(fields.name),
          String(fields.slug),
          String(fields.shortDescription),
          String(fields.fullDescription),
          price,
          discountPrice,
          String(fields.sku),
          String(fields.brandId),
          String(fields.categoryId),
          Number.isNaN(stock) ? 0 : stock,
          toBool(fields.isFeatured),
          toBool(fields.isNewArrival),
          toBool(fields.isBestSeller),
        ],
      );
      const product = createdRows[0];

      // Upload images → products/{productId}/{file}, first becomes the cover.
      const validFiles = files.filter((f) => isAllowedImage(f.mimetype, f.buffer.length));
      if (files.length > 0 && validFiles.length === 0) {
        await sql.unsafe("DELETE FROM products WHERE id = $1", [product.id]);
        return fail(res, 400, "Invalid image. Allowed types: JPG, JPEG, PNG, WEBP (max 5MB).");
      }

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const { url, path } = await uploadImage(file.buffer, product.id, file.filename, file.mimetype);
        uploadedPaths.push(path);
        await sql.unsafe(
          `INSERT INTO product_images (product_id, url, image_path, alt, "order", is_primary)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [product.id, url, path, String(fields.name), i, i === 0],
        );
      }

      // JSON clients may supply an image URL directly (guide's image_url field).
      if (validFiles.length > 0) {
        const first = await sql.unsafe(
          `SELECT url FROM product_images WHERE product_id = $1 ORDER BY "order" LIMIT 1`,
          [product.id],
        );
        await sql.unsafe("UPDATE products SET thumbnail_url = $1 WHERE id = $2", [first[0]?.url || null, product.id]);
      } else if (fields.thumbnailUrl || fields.image_url) {
        await sql.unsafe("UPDATE products SET thumbnail_url = $1 WHERE id = $2", [
          String(fields.thumbnailUrl || fields.image_url),
          product.id,
        ]);
      }

      const rows = await sql.unsafe(
        `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} WHERE p.id = $1 LIMIT 1`,
        [product.id],
      );
      return created(res, rows[0], "Product created");
    } catch (err) {
      await Promise.allSettled(uploadedPaths.map((p) => deleteImage(p)));
      if (isUniqueViolation(err)) return fail(res, 409, DUPLICATE_MESSAGE);
      console.error("[admin] product create failed:", err);
      return fail(res, 500, err instanceof Error ? err.message : "Failed to create product");
    }
  }

  return res.status(405).end();
});
