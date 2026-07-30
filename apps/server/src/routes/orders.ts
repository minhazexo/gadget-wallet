import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, desc, sql } from "drizzle-orm";
import { success, error } from "../utils/response";

export const orderRoutes = new Hono();

const createOrderSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().min(1), price: z.number() })),
  subtotal: z.number(),
  discount: z.number().default(0),
  shipping: z.number().default(0),
  total: z.number(),
  paymentMethod: z.string(),
  shippingAddressId: z.string().uuid(),
  couponId: z.string().uuid().optional(),
});

orderRoutes.post("/", zValidator("json", createOrderSchema), async (c) => {
  const data = c.req.valid("json");
  const [order] = await db.insert(schema.orders).values({
    userId: data.userId,
    status: "pending",
    total: data.total.toString(),
    subtotal: data.subtotal.toString(),
    discount: data.discount.toString(),
    shipping: data.shipping.toString(),
    paymentMethod: data.paymentMethod,
    shippingAddressId: data.shippingAddressId,
    couponId: data.couponId,
  }).returning();

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

  return success(c, order, "Order placed successfully");
});

orderRoutes.get("/user/:userId", async (c) => {
  const userId = c.req.param("userId");
  const orders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, userId))
    .orderBy(desc(schema.orders.createdAt));
  return success(c, orders);
});

orderRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!order) return error(c, 404, "Order not found");
  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id));
  return success(c, { ...order, items });
});
