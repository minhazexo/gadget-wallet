import sql from "../_lib/db.js";
import { requireAdmin } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";
import { deleteImage } from "../_lib/supabase.js";
import { PRODUCT_SELECT, PRODUCT_FROM, IMAGE_SELECT, SPEC_SELECT } from "../../_lib/products.js";

const DUPLICATE_MESSAGE = "A product with this slug or SKU already exists";

function isUniqueViolation(err) {
  return err && (err.code === "23505" || /duplicate key/i.test(err.message || ""));
}

function toBool(value) {
  return value === true || value === "true" || value === "1";
}

/**
 * GET    /api/admin/products/:id  → product + images + specs
 * PATCH  /api/admin/products/:id  → partial update (JSON body)
 * DELETE /api/admin/products/:id  → soft delete + remove images
 */
export default requireAdmin(async (req, res) => {
  const id = req.query.id;

  if (req.method === "GET") {
    try {
      const rows = await sql.unsafe(
        `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} WHERE p.id = $1 AND p.deleted_at IS NULL LIMIT 1`,
        [id],
      );
      const product = rows[0];
      if (!product) return fail(res, 404, "Product not found");
      const [images, specs] = await Promise.all([
        sql.unsafe(`SELECT ${IMAGE_SELECT} FROM product_images WHERE product_id = $1 ORDER BY "order"`, [id]),
        sql.unsafe(`SELECT ${SPEC_SELECT} FROM product_specs WHERE product_id = $1`, [id]),
      ]);
      return ok(res, { ...product, images, specs });
    } catch (err) {
      console.error("[admin] product detail failed:", err);
      return fail(res, 500, "Failed to load product");
    }
  }

  if (req.method === "PATCH") {
    const body = req.body || {};
    try {
      // Build the SET clause from only the fields the caller sent, so a
      // partial update never wipes fields it didn't include (e.g. a
      // stock-only edit must not clear the discount).
      const sets = [];
      const params = [];
      const push = (col, val) => {
        params.push(val);
        sets.push(`${col} = $${params.length}`);
      };

      if (body.name !== undefined) push("name", String(body.name));
      if (body.slug !== undefined) push("slug", String(body.slug));
      if (body.shortDescription !== undefined) push("short_description", String(body.shortDescription));
      if (body.fullDescription !== undefined) push("full_description", String(body.fullDescription));
      if (body.price !== undefined) push("price", String(body.price));
      // discountPrice is optional: only null it out when the caller sent it.
      if ("discountPrice" in body) {
        push("discount_price", body.discountPrice ? String(body.discountPrice) : null);
      }
      if (body.sku !== undefined) push("sku", String(body.sku));
      if (body.brandId !== undefined) push("brand_id", String(body.brandId));
      if (body.categoryId !== undefined) push("category_id", String(body.categoryId));
      if (body.stock !== undefined) push("stock", parseInt(body.stock, 10));
      if (body.isFeatured !== undefined) push("is_featured", toBool(body.isFeatured));
      if (body.isNewArrival !== undefined) push("is_new_arrival", toBool(body.isNewArrival));
      if (body.isBestSeller !== undefined) push("is_best_seller", toBool(body.isBestSeller));

      if (sets.length === 0) return fail(res, 400, "Nothing to update");

      params.push(id);
      const rows = await sql.unsafe(
        `UPDATE products SET ${sets.join(", ")}, updated_at = NOW()
         WHERE id = $${params.length} AND deleted_at IS NULL
         RETURNING id`,
        params,
      );
      if (!rows[0]) return fail(res, 404, "Product not found");
      const updated = await sql.unsafe(
        `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} WHERE p.id = $1 LIMIT 1`,
        [id],
      );
      return ok(res, updated[0], "Product updated");
    } catch (err) {
      if (isUniqueViolation(err)) return fail(res, 409, DUPLICATE_MESSAGE);
      console.error("[admin] product update failed:", err);
      return fail(res, 500, err instanceof Error ? err.message : "Failed to update product");
    }
  }

  if (req.method === "DELETE") {
    try {
      const rows = await sql.unsafe(
        "SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL LIMIT 1",
        [id],
      );
      if (!rows[0]) return fail(res, 404, "Product not found");

      const images = await sql.unsafe(
        `SELECT image_path AS "imagePath", url FROM product_images WHERE product_id = $1`,
        [id],
      );
      await Promise.allSettled(
        images.map((img) => deleteImage(img.imagePath || img.url)),
      );
      await sql.unsafe("DELETE FROM product_images WHERE product_id = $1", [id]);
      await sql.unsafe("DELETE FROM product_specs WHERE product_id = $1", [id]);
      await sql.unsafe(
        "UPDATE products SET deleted_at = NOW(), thumbnail_url = NULL, updated_at = NOW() WHERE id = $1",
        [id],
      );
      return ok(res, null, "Product deleted and its images removed");
    } catch (err) {
      console.error("[admin] product delete failed:", err);
      return fail(res, 500, "Failed to delete product");
    }
  }

  return res.status(405).end();
});
