import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";
import { ORDER_SELECT, enrichOrder } from "../_lib/orders.js";

/** GET /api/orders/:id — the current user's order, enriched. */
export default requireAuth(async (req, res) => {
  if (req.method !== "GET") return res.status(405).end();
  const id = req.query.id;
  if (!id) return fail(res, 400, "Order id is required");

  try {
    const rows = await sql.unsafe(
      `SELECT ${ORDER_SELECT} FROM orders WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [id, req.user.id],
    );
    const order = rows[0];
    if (!order) return fail(res, 404, "Order not found");
    return ok(res, await enrichOrder(order));
  } catch (err) {
    console.error("[orders] detail failed:", err);
    return fail(res, 500, "Failed to fetch order");
  }
});
