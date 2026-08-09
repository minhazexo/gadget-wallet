import sql from "../../_lib/db.js";
import { ok, fail } from "../../_lib/respond.js";
import { ORDER_SELECT, enrichOrder } from "../../_lib/orders.js";

/** GET /api/orders/user/:userId — public read of a user's orders (MyOrders page). */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const userId = req.query.userId;
  if (!userId) return fail(res, 400, "userId is required");

  try {
    const orders = await sql.unsafe(
      `SELECT ${ORDER_SELECT} FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    const enriched = await Promise.all(orders.map((order) => enrichOrder(order)));
    return ok(res, enriched);
  } catch (err) {
    console.error("[orders] user list failed:", err);
    return fail(res, 500, "Failed to fetch orders");
  }
}
