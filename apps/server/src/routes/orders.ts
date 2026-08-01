import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { success, error } from "../utils/response";

export const orderRoutes = new Hono();

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().min(1), price: z.number() })),
  subtotal: z.number(),
  discount: z.number().default(0),
  shipping: z.number().default(0),
  total: z.number(),
  paymentMethod: z.string(),
  shippingAddressId: z.string().uuid(),
  couponId: z.string().uuid().optional(),
  paymentStatus: z.enum(["pending", "paid"]).default("pending"),
});

async function enrichOrder(order: any) {
  const items = await db
    .select({
      id: schema.orderItems.id,
      productId: schema.orderItems.productId,
      quantity: schema.orderItems.quantity,
      price: schema.orderItems.price,
      name: schema.products.name,
      slug: schema.products.slug,
      image: sql<string>`(
        SELECT ${schema.productImages.url} FROM ${schema.productImages}
        WHERE ${schema.productImages.productId} = ${schema.orderItems.productId}
        ORDER BY ${schema.productImages.order} ASC LIMIT 1
      )`,
    })
    .from(schema.orderItems)
    .leftJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
    .where(eq(schema.orderItems.orderId, order.id));

  let shippingAddress = null;
  if (order.shippingAddressId) {
    const [addr] = await db
      .select()
      .from(schema.addresses)
      .where(eq(schema.addresses.id, order.shippingAddressId))
      .limit(1);
    shippingAddress = addr || null;
  }

  return { ...order, items, shippingAddress };
}

orderRoutes.use("/", requireAuth);

orderRoutes.post("/", zValidator("json", createOrderSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");

  const [order] = await db
    .insert(schema.orders)
    .values({
      userId: user.id,
      status: "pending",
      paymentStatus: data.paymentStatus,
      total: data.total.toString(),
      subtotal: data.subtotal.toString(),
      discount: data.discount.toString(),
      shipping: data.shipping.toString(),
      paymentMethod: data.paymentMethod,
      shippingAddressId: data.shippingAddressId,
      couponId: data.couponId,
    })
    .returning();

  for (const item of data.items) {
    await db.insert(schema.orderItems).values({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price.toString(),
    });
    await db
      .update(schema.products)
      .set({ stock: sql`${schema.products.stock} - ${item.quantity}` })
      .where(eq(schema.products.id, item.productId));
  }

  // Create an order notification
  await db.insert(schema.notifications).values({
    userId: user.id,
    type: "order",
    title: "Order placed",
    message: `Your order ${order.id.slice(0, 8).toUpperCase()} has been placed successfully.`,
  });

  return success(c, await enrichOrder(order), "Order placed successfully");
});

// Current user's orders (with items + product info)
orderRoutes.get("/", async (c) => {
  const user = c.get("user");
  const orders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, user.id))
    .orderBy(desc(schema.orders.createdAt));
  const enriched = await Promise.all(orders.map((o) => enrichOrder(o as any)));
  return success(c, enriched);
});

// Back-compat: user orders by id (public read)
orderRoutes.get("/user/:userId", async (c) => {
  const userId = c.req.param("userId");
  const orders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, userId))
    .orderBy(desc(schema.orders.createdAt));
  const enriched = await Promise.all(orders.map((o) => enrichOrder(o as any)));
  return success(c, enriched);
});

orderRoutes.post("/:id/cancel", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.id, id), eq(schema.orders.userId, user.id)))
    .limit(1);
  if (!order) return error(c, 404, "Order not found");

  const cancellable = ["pending", "confirmed", "processing"];
  if (!cancellable.includes(order.status)) {
    return error(c, 400, "Order can only be cancelled before it ships");
  }

  // Restore stock
  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, order.id));
  for (const item of items) {
    await db
      .update(schema.products)
      .set({ stock: sql`${schema.products.stock} + ${item.quantity}` })
      .where(eq(schema.products.id, item.productId));
  }

  await db
    .update(schema.orders)
    .set({ status: "cancelled", paymentStatus: order.paymentStatus === "paid" ? "refunded" : order.paymentStatus })
    .where(eq(schema.orders.id, order.id));

  await db.insert(schema.notifications).values({
    userId: user.id,
    type: "order",
    title: "Order cancelled",
    message: `Order ${order.id.slice(0, 8).toUpperCase()} has been cancelled.`,
  });

  return success(c, null, "Order cancelled successfully");
});

orderRoutes.post("/:id/return", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.id, id), eq(schema.orders.userId, user.id)))
    .limit(1);
  if (!order) return error(c, 404, "Order not found");
  if (order.status !== "delivered") return error(c, 400, "Return requests are only available for delivered orders");
  if (order.returnRequestedAt) return error(c, 400, "Return already requested for this order");

  await db
    .update(schema.orders)
    .set({ returnRequestedAt: new Date() })
    .where(eq(schema.orders.id, order.id));

  await db.insert(schema.notifications).values({
    userId: user.id,
    type: "return",
    title: "Return requested",
    message: `Return request for order ${order.id.slice(0, 8).toUpperCase()} has been submitted.`,
  });

  return success(c, null, "Return request submitted successfully");
});

orderRoutes.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.id, id), eq(schema.orders.userId, user.id)))
    .limit(1);
  if (!order) return error(c, 404, "Order not found");
  return success(c, await enrichOrder(order as any));
});

orderRoutes.get("/:id/invoice", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.id, id), eq(schema.orders.userId, user.id)))
    .limit(1);
  if (!order) return error(c, 404, "Order not found");

  const enriched = await enrichOrder(order as any);
  const rows = enriched.items
    .map(
      (it: any) =>
        `<tr><td>${it.name}</td><td>${it.quantity}</td><td>$${Number(it.price).toFixed(2)}</td><td>$${(Number(it.price) * it.quantity).toFixed(2)}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html><head><title>Invoice - Gadget Wallet</title></head>
<body style="font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #111827;">
  <h1 style="color: #e11d2e;">Gadget Wallet</h1>
  <p>Invoice for order <strong>${order.id}</strong></p>
  <p>Date: ${order.createdAt.toLocaleString()}</p>
  <p>Customer: ${user.name} (${user.email})</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <thead><tr style="background: #f8fafc; text-align: left;">
      <th style="padding: 8px; border-bottom: 2px solid #e5e7eb;">Product</th>
      <th style="padding: 8px; border-bottom: 2px solid #e5e7eb;">Qty</th>
      <th style="padding: 8px; border-bottom: 2px solid #e5e7eb;">Price</th>
      <th style="padding: 8px; border-bottom: 2px solid #e5e7eb;">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="text-align: right; margin-top: 20px;">Subtotal: $${Number(order.subtotal).toFixed(2)}<br/>
  Discount: $${Number(order.discount).toFixed(2)}<br/>
  Shipping: $${Number(order.shipping).toFixed(2)}<br/>
  <strong style="font-size: 18px;">Total: $${Number(order.total).toFixed(2)}</strong></p>
  <p style="color: #6b7280; margin-top: 30px;">Payment: ${order.paymentStatus} | Delivery: ${order.status}</p>
</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
});
