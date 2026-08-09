import sql from "../../_lib/db.js";
import { requireAuth } from "../../_lib/auth.js";
import { ok, fail } from "../../_lib/respond.js";

const CANCELLABLE_STATUSES = ["pending", "confirmed", "processing"];

/** POST /api/orders/:id/cancel — cancels a pending/confirmed/processing order and restores stock. */
export default requireAuth(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const id = req.query.id;
  if (!id) return fail(res, 400, "Order id is required");

  try {
    const rows = await sql.unsafe(
      "SELECT id, status, payment_status AS \"paymentStatus\" FROM orders WHERE id = $1 AND user_id = $2 LIMIT 1",
      [id, req.user.id],
    );
    const order = rows[0];
    if (!order) return fail(res, 404, "Order not found");
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return fail(res, 400, "Order can only be cancelled before it ships");
    }

    const items = await sql.unsafe(
      "SELECT product_id AS \"productId\", quantity FROM order_items WHERE order_id = $1",
      [id],
    );
    for (const item of items) {
      await sql.unsafe("UPDATE products SET stock = stock + $1 WHERE id = $2", [
        item.quantity,
        item.productId,
      ]);
    }

    const newPaymentStatus = order.paymentStatus === "paid" ? "refunded" : order.paymentStatus;
    await sql.unsafe(
      "UPDATE orders SET status = 'cancelled', payment_status = $1, updated_at = NOW() WHERE id = $2",
      [newPaymentStatus, id],
    );

    await sql.unsafe(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'order', 'Order cancelled',
               'Order ${id.slice(0, 8).toUpperCase()} has been cancelled.')`,
      [req.user.id],
    );

    return ok(res, null, "Order cancelled successfully");
  } catch (err) {
    console.error("[orders] cancel failed:", err);
    return fail(res, 500, "Failed to cancel order");
  }
});
