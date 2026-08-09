import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/** POST /api/notifications/read-all — mark every notification as read. */
export default requireAuth(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  try {
    await sql.unsafe("UPDATE notifications SET is_read = true WHERE user_id = $1", [req.user.id]);
    return ok(res, null, "All notifications marked as read");
  } catch (err) {
    console.error("[notifications] read-all failed:", err);
    return fail(res, 500, "Failed to mark notifications as read");
  }
});
