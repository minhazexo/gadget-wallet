import bcrypt from "bcryptjs";
import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/** PUT /api/profile/password { currentPassword, newPassword } */
export default requireAuth(async (req, res) => {
  if (req.method !== "PUT") return res.status(405).end();

  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword) return fail(res, 400, "Current password is required");
  if (!newPassword || newPassword.length < 8) {
    return fail(res, 400, "New password must be at least 8 characters");
  }

  try {
    const rows = await sql.unsafe(
      "SELECT password_hash AS \"passwordHash\" FROM users WHERE id = $1 LIMIT 1",
      [req.user.id],
    );
    const user = rows[0];
    if (!user) return fail(res, 404, "User not found");

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return fail(res, 400, "Current password is incorrect");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await sql.unsafe(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, req.user.id],
    );
    return ok(res, null, "Password changed successfully");
  } catch (err) {
    console.error("[profile] password change failed:", err);
    return fail(res, 500, "Failed to change password");
  }
});
