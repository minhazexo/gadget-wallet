import sql from "../../_lib/db.js";
import { requireAuth } from "../../_lib/auth.js";
import { ok, fail } from "../../_lib/respond.js";

/** POST /api/orders/:id/return — request a return for a delivered order. */
export default requireAuth(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const id = req.query.id;
  if (!id) return fail(res, 400, "Order id is required");

  try {
    const rows = await sql.unsafe(
      `SELECT id, status, return_requested_at AS "returnRequestedAt"
       FROM orders WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [id, req.user.id],
    );
    const order = rows[0];
    if (!order) return fail(res, 404, "Order not found");
    if (order.status !== "delivered") {
      return fail(res, 400, "Return requests are only available for delivered orders");
    }
    if (order.returnRequestedAt) {
      return fail(res, 400, "Return already requested for this order");
    }

    await sql.unsafe("UPDATE orders SET return_requested_at = NOW(), updated_at = NOW() WHERE id = $1", [id]);

    await sql.unsafe(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'return', 'Return requested',
               'Return request for order ${id.slice(0, 8).toUpperCase()} has been submitted.')`,
      [req.user.id],
    );

    return ok(res, null, "Return request submitted successfully");
  } catch (err) {
    console.error("[orders] return failed:", err);
    return fail(res, 500, "Failed to submit return request");
  }
});
