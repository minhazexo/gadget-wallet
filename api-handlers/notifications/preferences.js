import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

const PREFS_SELECT = `
  order_updates AS "orderUpdates", promotional, sms, push
`;

const DEFAULTS = { orderUpdates: true, promotional: true, sms: false, push: true };

/** GET /api/notifications/preferences and PUT /api/notifications/preferences. */
export default requireAuth(async (req, res) => {
  if (req.method === "GET") {
    try {
      const rows = await sql.unsafe(
        `SELECT ${PREFS_SELECT} FROM notification_preferences WHERE user_id = $1 LIMIT 1`,
        [req.user.id],
      );
      return ok(res, rows[0] || DEFAULTS);
    } catch (err) {
      console.error("[notifications] prefs get failed:", err);
      return fail(res, 500, "Failed to fetch notification preferences");
    }
  }

  if (req.method === "PUT") {
    const body = req.body || {};
    const picks = ["orderUpdates", "promotional", "sms", "push"];
    const hasAny = picks.some((k) => typeof body[k] === "boolean");
    if (!hasAny) return fail(res, 400, "Provide at least one preference to update");

    try {
      const existing = await sql.unsafe(
        "SELECT id FROM notification_preferences WHERE user_id = $1 LIMIT 1",
        [req.user.id],
      );
      let rows;
      if (existing[0]) {
        const sets = [];
        const params = [];
        const push = (col, val) => {
          params.push(val);
          sets.push(`${col} = $${params.length}`);
        };
        for (const [key, col] of [
          ["orderUpdates", "order_updates"],
          ["promotional", "promotional"],
          ["sms", "sms"],
          ["push", "push"],
        ]) {
          if (typeof body[key] === "boolean") push(col, body[key]);
        }
        params.push(existing[0].id);
        rows = await sql.unsafe(
          `UPDATE notification_preferences SET ${sets.join(", ")}, updated_at = NOW()
           WHERE id = $${params.length} RETURNING ${PREFS_SELECT}`,
          params,
        );
      } else {
        rows = await sql.unsafe(
          `INSERT INTO notification_preferences (user_id, order_updates, promotional, sms, push)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING ${PREFS_SELECT}`,
          [
            req.user.id,
            body.orderUpdates ?? DEFAULTS.orderUpdates,
            body.promotional ?? DEFAULTS.promotional,
            body.sms ?? DEFAULTS.sms,
            body.push ?? DEFAULTS.push,
          ],
        );
      }
      return ok(res, rows[0], "Notification preferences updated");
    } catch (err) {
      console.error("[notifications] prefs update failed:", err);
      return fail(res, 500, "Failed to update notification preferences");
    }
  }

  return res.status(405).end();
});
