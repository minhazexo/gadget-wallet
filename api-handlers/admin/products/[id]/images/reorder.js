import sql from "../../../../_lib/db.js";
import { requireAdmin } from "../../../../_lib/auth.js";
import { ok, fail } from "../../../../_lib/respond.js";

/** PATCH /api/admin/products/:id/images/reorder { imageIds: [...] } */
export default requireAdmin(async (req, res) => {
  if (req.method !== "PATCH") return res.status(405).end();
  const productId = req.query.id;
  const imageIds = req.body?.imageIds;

  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    return fail(res, 400, "imageIds must be a non-empty array");
  }

  try {
    const existing = await sql.unsafe(
      "SELECT id FROM product_images WHERE product_id = $1",
      [productId],
    );
    const existingIds = new Set(existing.map((e) => e.id));
    if (
      imageIds.length !== existing.length ||
      imageIds.some((x) => typeof x !== "string" || !existingIds.has(x))
    ) {
      return fail(res, 400, "imageIds must contain exactly this product's images");
    }

    // Update order, clear is_primary, promote the first image.
    for (let i = 0; i < imageIds.length; i++) {
      await sql.unsafe('UPDATE product_images SET "order" = $1 WHERE id = $2', [i, imageIds[i]]);
    }
    await sql.unsafe("UPDATE product_images SET is_primary = false WHERE product_id = $1", [productId]);
    await sql.unsafe("UPDATE product_images SET is_primary = true WHERE id = $1", [imageIds[0]]);

    const first = await sql.unsafe("SELECT url FROM product_images WHERE id = $1 LIMIT 1", [imageIds[0]]);
    await sql.unsafe("UPDATE products SET thumbnail_url = $1, updated_at = NOW() WHERE id = $2", [
      first[0]?.url || null,
      productId,
    ]);

    return ok(res, null, "Images reordered");
  } catch (err) {
    console.error("[admin] image reorder failed:", err);
    return fail(res, 500, "Failed to reorder images");
  }
});
