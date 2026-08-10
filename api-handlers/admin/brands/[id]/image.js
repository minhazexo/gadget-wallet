import sql from "../../../_lib/db.js";
import { requireAdmin } from "../../../_lib/auth.js";
import { ok, fail } from "../../../_lib/respond.js";
import { parseMultipart } from "../../../_lib/multipart.js";
import { uploadBrandImage, deleteImage, isAllowedImage } from "../../../_lib/supabase.js";

const BRAND_SELECT = `
  id, name, slug, logo, description, created_at AS "createdAt"
`;

/**
 * POST   /api/admin/brands/:id/image — multipart "image" file.
 *        Replaces the existing brand logo: the old storage file is deleted
 *        (best effort) after the new one is safely persisted.
 * DELETE /api/admin/brands/:id/image — removes the logo (storage + DB).
 */
export default requireAdmin(async (req, res) => {
  const id = req.query.id;

  if (req.method === "POST") {
    try {
      const brand = await sql.unsafe("SELECT id, logo FROM brands WHERE id = $1 LIMIT 1", [id]);
      if (!brand[0]) return fail(res, 404, "Brand not found");

      const { files } = await parseMultipart(req);
      const valid = files.filter((f) => isAllowedImage(f.mimetype, f.buffer.length));
      if (files.length > 0 && valid.length === 0) {
        return fail(res, 400, "Invalid image. Allowed types: JPG, JPEG, PNG, WEBP (max 5MB).");
      }
      if (valid.length === 0) return fail(res, 400, "No image file provided");
      if (valid.length > 1) return fail(res, 400, "A brand can have exactly one logo — send a single image file");

      const file = valid[0];
      const { url, path } = await uploadBrandImage(file.buffer, id, file.filename, file.mimetype);

      try {
        await sql.unsafe("UPDATE brands SET logo = $1 WHERE id = $2", [url, id]);
      } catch (err) {
        // Roll back the upload so we don't leave an orphaned file.
        await deleteImage(path).catch(() => {});
        throw err;
      }

      // Best-effort cleanup of the previous logo — the DB already points at
      // the new file, so a failure here can only leave an orphan in storage.
      const previous = brand[0].logo;
      if (previous) await deleteImage(previous).catch(() => {});

      const updated = await sql.unsafe(`SELECT ${BRAND_SELECT} FROM brands WHERE id = $1 LIMIT 1`, [id]);
      return ok(res, { ...updated[0], imagePath: path }, "Brand logo updated");
    } catch (err) {
      console.error("[admin] brand logo upload failed:", err);
      return fail(res, 500, err instanceof Error ? err.message : "Failed to upload brand logo");
    }
  }

  if (req.method === "DELETE") {
    try {
      const brand = await sql.unsafe("SELECT id, logo FROM brands WHERE id = $1 LIMIT 1", [id]);
      if (!brand[0]) return fail(res, 404, "Brand not found");

      if (brand[0].logo) await deleteImage(brand[0].logo);
      await sql.unsafe("UPDATE brands SET logo = NULL WHERE id = $1", [id]);

      const updated = await sql.unsafe(`SELECT ${BRAND_SELECT} FROM brands WHERE id = $1 LIMIT 1`, [id]);
      return ok(res, updated[0], "Brand logo removed");
    } catch (err) {
      console.error("[admin] brand logo delete failed:", err);
      return fail(res, 500, "Failed to remove brand logo");
    }
  }

  return res.status(405).end();
});
