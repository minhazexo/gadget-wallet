import sql from "../../../../_lib/db.js";
import { requireAdmin } from "../../../../_lib/auth.js";
import { ok, fail } from "../../../../_lib/respond.js";
import { deleteImage } from "../../../../_lib/supabase.js";
import { IMAGE_SELECT } from "../../../../_lib/products.js";

/**
 * PATCH  /api/admin/products/:id/images/:imageId  { alt?, isPrimary? }
 * DELETE /api/admin/products/:id/images/:imageId
 * Ownership is enforced: the image must belong to the product in the URL.
 */
export default requireAdmin(async (req, res) => {
  const { id: productId, imageId } = req.query;

  try {
    const rows = await sql.unsafe("SELECT * FROM product_images WHERE id = $1 LIMIT 1", [imageId]);
    const image = rows[0];
    if (!image || image.product_id !== productId) {
      return fail(res, 404, "Image not found for this product");
    }

    if (req.method === "DELETE") {
      await deleteImage(image.image_path || image.url);
      await sql.unsafe("DELETE FROM product_images WHERE id = $1", [imageId]);

      if (image.is_primary) {
        const remaining = await sql.unsafe(
          'SELECT id, url FROM product_images WHERE product_id = $1 ORDER BY "order" LIMIT 1',
          [productId],
        );
        if (remaining[0]) {
          await sql.unsafe("UPDATE product_images SET is_primary = true WHERE id = $1", [remaining[0].id]);
          await sql.unsafe("UPDATE products SET thumbnail_url = $1, updated_at = NOW() WHERE id = $2", [
            remaining[0].url,
            productId,
          ]);
        } else {
          await sql.unsafe("UPDATE products SET thumbnail_url = NULL, updated_at = NOW() WHERE id = $1", [productId]);
        }
      }
      return ok(res, null, "Image deleted");
    }

    if (req.method === "PATCH") {
      const { alt, isPrimary } = req.body || {};
      if (typeof alt !== "string" && isPrimary !== true) {
        return fail(res, 400, "Nothing to update — provide alt or isPrimary");
      }

      if (isPrimary === true) {
        await sql.unsafe("UPDATE product_images SET is_primary = false WHERE product_id = $1", [productId]);
        await sql.unsafe("UPDATE product_images SET is_primary = true WHERE id = $1", [imageId]);
        await sql.unsafe("UPDATE products SET thumbnail_url = $1, updated_at = NOW() WHERE id = $2", [
          image.url,
          productId,
        ]);
      }
      if (typeof alt === "string" && alt.trim()) {
        await sql.unsafe("UPDATE product_images SET alt = $1 WHERE id = $2", [alt.trim(), imageId]);
      }

      const updated = await sql.unsafe(
        `SELECT ${IMAGE_SELECT} FROM product_images WHERE id = $1 LIMIT 1`,
        [imageId],
      );
      return ok(res, updated[0], "Image updated");
    }

    return res.status(405).end();
  } catch (err) {
    console.error("[admin] image operation failed:", err);
    return fail(res, 500, err instanceof Error ? err.message : "Failed to update image");
  }
});
