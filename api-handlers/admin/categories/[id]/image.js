import sql from "../../../_lib/db.js";
import { requireAdmin } from "../../../_lib/auth.js";
import { ok, fail } from "../../../_lib/respond.js";
import { parseMultipart } from "../../../_lib/multipart.js";
import { uploadCategoryImage, deleteImage, isAllowedImage } from "../../../_lib/supabase.js";

const CATEGORY_SELECT = `
  id, name, slug, description, image, parent_id AS "parentId",
  created_at AS "createdAt", updated_at AS "updatedAt"
`;

/**
 * POST   /api/admin/categories/:id/image — multipart "image" file.
 *        Replaces the existing category photo: the old storage file is
 *        deleted (best effort) before the new one is saved, so a category
 *        never has orphaned covers.
 * DELETE /api/admin/categories/:id/image — removes the photo (storage + DB).
 */
export default requireAdmin(async (req, res) => {
  const id = req.query.id;

  if (req.method === "POST") {
    try {
      const category = await sql.unsafe("SELECT id, image FROM categories WHERE id = $1 LIMIT 1", [id]);
      if (!category[0]) return fail(res, 404, "Category not found");

      const { files } = await parseMultipart(req);
      const valid = files.filter((f) => isAllowedImage(f.mimetype, f.buffer.length));
      if (files.length > 0 && valid.length === 0) {
        return fail(res, 400, "Invalid image. Allowed types: JPG, JPEG, PNG, WEBP (max 5MB).");
      }
      if (valid.length === 0) return fail(res, 400, "No image file provided");
      if (valid.length > 1) return fail(res, 400, "A category can have exactly one photo — send a single image file");

      const file = valid[0];
      const { url, path } = await uploadCategoryImage(file.buffer, id, file.filename, file.mimetype);

      try {
        // Persist the new URL first — if this fails we can clean up the new
        // file and the previous cover (and its DB reference) stay untouched.
        await sql.unsafe("UPDATE categories SET image = $1, updated_at = NOW() WHERE id = $2", [url, id]);
      } catch (err) {
        // Roll back the upload we just made so we don't leave an orphaned file.
        await deleteImage(path).catch(() => {});
        throw err;
      }

      // Best-effort cleanup of the previous cover — the DB already points at
      // the new file, so a failure here can only leave an orphan in storage.
      const previous = category[0].image;
      if (previous) await deleteImage(previous).catch(() => {});

      const updated = await sql.unsafe(`SELECT ${CATEGORY_SELECT} FROM categories WHERE id = $1 LIMIT 1`, [id]);
      return ok(res, { ...updated[0], imagePath: path }, "Category photo updated");
    } catch (err) {
      console.error("[admin] category photo upload failed:", err);
      return fail(res, 500, err instanceof Error ? err.message : "Failed to upload category photo");
    }
  }

  if (req.method === "DELETE") {
    try {
      const category = await sql.unsafe("SELECT id, image FROM categories WHERE id = $1 LIMIT 1", [id]);
      if (!category[0]) return fail(res, 404, "Category not found");

      if (category[0].image) await deleteImage(category[0].image);
      await sql.unsafe("UPDATE categories SET image = NULL, updated_at = NOW() WHERE id = $1", [id]);

      const updated = await sql.unsafe(`SELECT ${CATEGORY_SELECT} FROM categories WHERE id = $1 LIMIT 1`, [id]);
      return ok(res, updated[0], "Category photo removed");
    } catch (err) {
      console.error("[admin] category photo delete failed:", err);
      return fail(res, 500, "Failed to remove category photo");
    }
  }

  return res.status(405).end();
});
