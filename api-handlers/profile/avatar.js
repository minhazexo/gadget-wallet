import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";
import { USER_SELECT } from "../_lib/users.js";
import { parseMultipart } from "../_lib/multipart.js";
import { uploadImage, deleteImage, isAllowedImage } from "../_lib/supabase.js";

/**
 * POST /api/profile/avatar — multipart upload of a profile photo.
 *
 * Mirrors the admin product image flow: the client sends FormData with a
 * "file" field, we validate + upload it to the public "products" bucket under
 * products/avatars/{userId}/ (no extra bucket setup needed), then store the
 * public URL in users.avatar. The previous avatar is deleted from storage
 * when it was one of ours.
 */
export default requireAuth(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { files } = await parseMultipart(req);
    const file = files[0];
    if (!file) return fail(res, 400, "No image file provided");
    if (!isAllowedImage(file.mimetype, file.buffer.length)) {
      return fail(res, 400, "Invalid image. Allowed types: JPG, PNG, WEBP (max 5MB).");
    }

    // Capture the OLD avatar BEFORE the DB update — it is what we may delete.
    // (Deleting after the update would re-read the NEW url and delete the
    // freshly uploaded file, which is exactly why avatars never persisted.)
    const [before] = await sql.unsafe("SELECT avatar FROM users WHERE id = $1", [req.user.id]);
    const oldAvatar = before?.avatar;

    // products/avatars/{userId}/{file} — distinct from product images.
    const { url } = await uploadImage(file.buffer, `avatars/${req.user.id}`, file.filename, file.mimetype);

    // Persist first so a failed write never loses the old avatar.
    const rows = await sql.unsafe(
      `UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2 RETURNING ${USER_SELECT}`,
      [url, req.user.id],
    );

    // Free the old avatar, but ONLY when it is one of ours (products/avatars/…).
    // deleteImage() would otherwise remove any object under the products
    // bucket — a user whose avatar was set to a product image URL via
    // PUT /api/profile could wipe that image by uploading a new photo.
    // Never delete the file we just uploaded (oldAvatar !== url guard).
    if (oldAvatar && oldAvatar !== url && oldAvatar.includes("/products/avatars/")) {
      await deleteImage(oldAvatar).catch(() => {});
    }

    return ok(res, rows[0], "Avatar updated successfully");
  } catch (err) {
    console.error("[profile] avatar upload failed:", err);
    return fail(res, 500, err instanceof Error ? err.message : "Failed to upload avatar");
  }
});
