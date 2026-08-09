import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/** POST /api/auth/logout-all — invalidates every issued session. */
export default requireAuth(async (req, res) => {
  try {
    await sql.unsafe(
      "UPDATE users SET token_version = token_version + 1, updated_at = NOW() WHERE id = $1",
      [req.user.id],
    );
    return ok(res, null, "Logged out from all devices");
  } catch (err) {
    console.error("[auth] logout-all failed:", err);
    return fail(res, 500, "Failed to log out");
  }
});
