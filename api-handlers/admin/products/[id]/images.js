import sql from "../../../_lib/db.js";
import { requireAdmin } from "../../../_lib/auth.js";
import { ok, fail } from "../../../_lib/respond.js";
import { parseMultipart } from "../../../_lib/multipart.js";
import { uploadImage, deleteImage, isAllowedImage } from "../../../_lib/supabase.js";
import { IMAGE_SELECT } from "../../../_lib/products.js";

const MAX_IMAGES_PER_PRODUCT = 12;

/** POST /api/admin/products/:id/images — multipart form with image files. */
export default requireAdmin(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const productId = req.query.id;

  try {
    const product = await sql.unsafe(
      "SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL LIMIT 1",
      [productId],
    );
    if (!product[0]) return fail(res, 404, "Product not found");

    const { fields, files } = await parseMultipart(req);
    const validFiles = files.filter((f) => isAllowedImage(f.mimetype, f.buffer.length));
    if (files.length > 0 && validFiles.length === 0) {
      return fail(res, 400, "Invalid image. Allowed types: JPG, JPEG, PNG, WEBP (max 5MB).");
    }
    if (validFiles.length === 0) return fail(res, 400, "No image file provided");

    const countRows = await sql.unsafe(
      'SELECT count(*)::int AS count, COALESCE(max("order"), -1)::int AS "maxOrder" FROM product_images WHERE product_id = $1',
      [productId],
    );
    const existing = Number(countRows[0]?.count || 0);
    const nextOrder = Number(countRows[0]?.maxOrder || -1) + 1;
    if (existing + validFiles.length > MAX_IMAGES_PER_PRODUCT) {
      return fail(res, 400, `A product can have at most ${MAX_IMAGES_PER_PRODUCT} images`);
    }

    const uploadedPaths = [];
    const makePrimary = existing === 0;
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const { url, path } = await uploadImage(file.buffer, productId, file.filename, file.mimetype);
      uploadedPaths.push(path);
      await sql.unsafe(
        `INSERT INTO product_images (product_id, url, image_path, alt, "order", is_primary)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [productId, url, path, String(fields.alt || ""), nextOrder + i, makePrimary && i === 0],
      );
    }

    if (makePrimary) {
      const first = await sql.unsafe(
        `SELECT url FROM product_images WHERE product_id = $1 ORDER BY "order" LIMIT 1`,
        [productId],
      );
      await sql.unsafe("UPDATE products SET thumbnail_url = $1, updated_at = NOW() WHERE id = $2", [
        first[0]?.url || null,
        productId,
      ]);
    }

    const images = await sql.unsafe(
      `SELECT ${IMAGE_SELECT} FROM product_images WHERE product_id = $1 ORDER BY "order"`,
      [productId],
    );
    return ok(res, images, `Uploaded ${validFiles.length} image${validFiles.length > 1 ? "s" : ""}`);
  } catch (err) {
    console.error("[admin] image upload failed:", err);
    return fail(res, 500, err instanceof Error ? err.message : "Failed to upload image");
  }
});
