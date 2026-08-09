import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";
import { USER_SELECT } from "../_lib/users.js";

/** PUT /api/profile/two-factor { enabled } → the updated user */
export default requireAuth(async (req, res) => {
  if (req.method !== "PUT") return res.status(405).end();
  const enabled = req.body?.enabled === true;
  try {
    const rows = await sql.unsafe(
      `UPDATE users SET two_factor_enabled = $1, updated_at = NOW() WHERE id = $2 RETURNING ${USER_SELECT}`,
      [enabled, req.user.id],
    );
    return ok(res, rows[0]);
  } catch (err) {
    console.error("[profile] two-factor update failed:", err);
    return fail(res, 500, "Failed to update two-factor settings");
  }
});
