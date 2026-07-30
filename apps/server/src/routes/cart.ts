import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, and } from "drizzle-orm";
import { success, error } from "../utils/response";

export const cartRoutes = new Hono();

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1),
  sessionId: z.string().optional(),
  userId: z.string().uuid().optional(),
});

cartRoutes.post("/add", zValidator("json", addItemSchema), async (c) => {
  const { productId, quantity, sessionId, userId } = c.req.valid("json");
  let [cart] = await db
    .select()
    .from(schema.carts)
    .where(userId ? eq(schema.carts.userId, userId) : eq(schema.carts.sessionId, sessionId!))
    .limit(1);
  if (!cart) {
    [cart] = await db.insert(schema.carts).values({ userId, sessionId }).returning();
  }
  const [existing] = await db
    .select()
    .from(schema.cartItems)
    .where(and(eq(schema.cartItems.cartId, cart.id), eq(schema.cartItems.productId, productId)))
    .limit(1);
  if (existing) {
    await db
      .update(schema.cartItems)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(schema.cartItems.id, existing.id));
  } else {
    await db.insert(schema.cartItems).values({ cartId: cart.id, productId, quantity });
  }
  return success(c, null, "Item added to cart");
});

cartRoutes.get("/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const cart = await db
    .select()
    .from(schema.carts)
    .where(eq(schema.carts.sessionId, sessionId))
    .limit(1);
  if (!cart.length) return success(c, { items: [] });
  const items = await db
    .select()
    .from(schema.cartItems)
    .where(eq(schema.cartItems.cartId, cart[0].id));
  return success(c, { cart: cart[0], items });
});
