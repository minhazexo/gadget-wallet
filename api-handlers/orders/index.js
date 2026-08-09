import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";
import { ORDER_SELECT, enrichOrder } from "../_lib/orders.js";

/**
 * POST /api/orders — create an order from { items, subtotal, discount,
 * shipping, total, paymentMethod, shippingAddressId, couponId?, paymentStatus? }.
 * GET  /api/orders — the current user's orders (enriched).
 */
export default requireAuth(async (req, res) => {
  if (req.method === "POST") {
    const data = req.body || {};
    const { items, subtotal, discount, shipping, total, paymentMethod, shippingAddressId, couponId } = data;
    const paymentStatus = data.paymentStatus === "paid" ? "paid" : "pending";

    if (!Array.isArray(items) || items.length === 0) {
      return fail(res, 400, "Order must contain at least one item");
    }
    if (
      !items.every((it) => it?.productId && Number.isInteger(it.quantity) && it.quantity >= 1 && it.price != null)
    ) {
      return fail(res, 400, "Each item needs productId, quantity and price");
    }
    if (subtotal == null || total == null || !paymentMethod || !shippingAddressId) {
      return fail(res, 400, "subtotal, total, paymentMethod and shippingAddressId are required");
    }

    try {
      const orderRows = await sql.unsafe(
        `INSERT INTO orders (
           user_id, status, payment_status, total, subtotal, discount, shipping,
           payment_method, shipping_address_id, coupon_id
         ) VALUES ($1, 'pending', $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING ${ORDER_SELECT}`,
        [
          req.user.id,
          paymentStatus,
          String(total),
          String(subtotal),
          discount ? String(discount) : "0",
          shipping ? String(shipping) : "0",
          paymentMethod,
          shippingAddressId,
          couponId || null,
        ],
      );
      const order = orderRows[0];

      for (const item of items) {
        await sql.unsafe(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
          [order.id, item.productId, item.quantity, String(item.price)],
        );
        await sql.unsafe("UPDATE products SET stock = stock - $1 WHERE id = $2", [
          item.quantity,
          item.productId,
        ]);
      }

      await sql.unsafe(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'order', 'Order placed',
                 'Your order ${order.id.slice(0, 8).toUpperCase()} has been placed successfully.')`,
        [req.user.id],
      );

      return ok(res, await enrichOrder(order), "Order placed successfully");
    } catch (err) {
      console.error("[orders] create failed:", err);
      return fail(res, 500, "Failed to place order");
    }
  }

  if (req.method === "GET") {
    try {
      const orders = await sql.unsafe(
        `SELECT ${ORDER_SELECT} FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.user.id],
      );
      const enriched = await Promise.all(orders.map((order) => enrichOrder(order)));
      return ok(res, enriched);
    } catch (err) {
      console.error("[orders] list failed:", err);
      return fail(res, 500, "Failed to fetch orders");
    }
  }

  return res.status(405).end();
});
