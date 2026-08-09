import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/** GET /api/notifications — the current user's notifications, newest first. */
export default requireAuth(async (req, res) => {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const notifications = await sql.unsafe(
      `SELECT id, type, title, message, is_read AS "isRead", created_at AS "createdAt"
       FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id],
    );
    return ok(res, notifications);
  } catch (err) {
    console.error("[notifications] list failed:", err);
    return fail(res, 500, "Failed to fetch notifications");
  }
});
