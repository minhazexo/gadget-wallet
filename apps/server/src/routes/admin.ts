import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, desc, sql, isNull } from "drizzle-orm";
import { success, error } from "../utils/response";

export const adminRoutes = new Hono();

adminRoutes.get("/dashboard", async (c) => {
  const [totalProducts] = await db
    .select({ count: sql`count(*)` })
    .from(schema.products)
    .where(isNull(schema.products.deletedAt));
  const [totalOrders] = await db.select({ count: sql`count(*)` }).from(schema.orders);
  const [totalUsers] = await db.select({ count: sql`count(*)` }).from(schema.users);
  const [revenue] = await db
    .select({ total: sql`coalesce(sum(total), 0)` })
    .from(schema.orders)
    .where(eq(schema.orders.status, "delivered"));
  return success(c, {
    totalProducts: Number(totalProducts.count),
    totalOrders: Number(totalOrders.count),
    totalUsers: Number(totalUsers.count),
    revenue: Number(revenue.total),
  });
});

adminRoutes.get("/orders", async (c) => {
  const orders = await db
    .select()
    .from(schema.orders)
    .orderBy(desc(schema.orders.createdAt))
    .limit(20);
  return success(c, orders);
});

adminRoutes.get("/orders/:id", async (c) => {
  const id = c.req.param("id");
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!order) return error(c, 404, "Order not found");
  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id));
  return success(c, { ...order, items });
});

adminRoutes.patch("/orders/:id/status", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json();
  const [order] = await db
    .update(schema.orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.orders.id, id))
    .returning();
  return success(c, order, "Order status updated");
});

adminRoutes.get("/products", async (c) => {
  const products = await db
    .select()
    .from(schema.products)
    .where(isNull(schema.products.deletedAt))
    .orderBy(desc(schema.products.createdAt));
  return success(c, products);
});

adminRoutes.delete("/products/:id", async (c) => {
  const id = c.req.param("id");
  await db.update(schema.products).set({ deletedAt: new Date() }).where(eq(schema.products.id, id));
  return success(c, null, "Product soft-deleted");
});

adminRoutes.get("/users", async (c) => {
  const users = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .where(isNull(schema.users.deletedAt))
    .orderBy(desc(schema.users.createdAt));
  return success(c, users);
});
