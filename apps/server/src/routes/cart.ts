import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, and, sql } from "drizzle-orm";
import { success, error } from "../utils/response";

export const cartRoutes = new Hono();

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1),
  sessionId: z.string().optional(),
  userId: z.string().uuid().optional(),
});

const updateItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1),
  sessionId: z.string().optional(),
  userId: z.string().uuid().optional(),
});

const removeItemSchema = z.object({
  productId: z.string().uuid(),
  sessionId: z.string().optional(),
  userId: z.string().uuid().optional(),
});

const mergeSchema = z.object({
  sessionId: z.string(),
  userId: z.string().uuid(),
});

async function enrichItems(cartId: string) {
  return db
    .select({
      id: schema.cartItems.id,
      productId: schema.cartItems.productId,
      quantity: schema.cartItems.quantity,
      name: schema.products.name,
      slug: schema.products.slug,
      price: schema.products.price,
      discountPrice: schema.products.discountPrice,
      stock: schema.products.stock,
      image: sql<string>`(
        SELECT ${schema.productImages.url} FROM ${schema.productImages}
        WHERE ${schema.productImages.productId} = ${schema.cartItems.productId}
        ORDER BY ${schema.productImages.order} ASC LIMIT 1
      )`,
    })
    .from(schema.cartItems)
    .leftJoin(schema.products, eq(schema.cartItems.productId, schema.products.id))
    .where(eq(schema.cartItems.cartId, cartId));
}

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

cartRoutes.patch("/update", zValidator("json", updateItemSchema), async (c) => {
  const { productId, quantity, sessionId, userId } = c.req.valid("json");
  const [cart] = await db
    .select()
    .from(schema.carts)
    .where(userId ? eq(schema.carts.userId, userId) : eq(schema.carts.sessionId, sessionId!))
    .limit(1);
  if (!cart) return error(c, 404, "Cart not found");
  await db
    .update(schema.cartItems)
    .set({ quantity })
    .where(and(eq(schema.cartItems.cartId, cart.id), eq(schema.cartItems.productId, productId)));
  return success(c, null, "Cart updated");
});

cartRoutes.delete("/remove", zValidator("json", removeItemSchema), async (c) => {
  const { productId, sessionId, userId } = c.req.valid("json");
  const [cart] = await db
    .select()
    .from(schema.carts)
    .where(userId ? eq(schema.carts.userId, userId) : eq(schema.carts.sessionId, sessionId!))
    .limit(1);
  if (!cart) return error(c, 404, "Cart not found");
  await db
    .delete(schema.cartItems)
    .where(and(eq(schema.cartItems.cartId, cart.id), eq(schema.cartItems.productId, productId)));
  return success(c, null, "Item removed from cart");
});

// Merge guest cart into a user's cart (called after login/register)
cartRoutes.post("/merge", zValidator("json", mergeSchema), async (c) => {
  const { sessionId, userId } = c.req.valid("json");
  const [guestCart] = await db
    .select()
    .from(schema.carts)
    .where(eq(schema.carts.sessionId, sessionId))
    .limit(1);
  let [userCart] = await db
    .select()
    .from(schema.carts)
    .where(eq(schema.carts.userId, userId))
    .limit(1);
  if (!userCart) {
    [userCart] = await db.insert(schema.carts).values({ userId }).returning();
  }

  if (guestCart && guestCart.id !== userCart.id) {
    const guestItems = await db
      .select()
      .from(schema.cartItems)
      .where(eq(schema.cartItems.cartId, guestCart.id));
    for (const item of guestItems) {
      const [existing] = await db
        .select()
        .from(schema.cartItems)
        .where(and(eq(schema.cartItems.cartId, userCart.id), eq(schema.cartItems.productId, item.productId)))
        .limit(1);
      if (existing) {
        await db
          .update(schema.cartItems)
          .set({ quantity: existing.quantity + item.quantity })
          .where(eq(schema.cartItems.id, existing.id));
      } else {
        await db.insert(schema.cartItems).values({
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }
    await db.delete(schema.carts).where(eq(schema.carts.id, guestCart.id));
  }
  return success(c, null, "Cart merged successfully");
});

// Guest cart (kept for back-compat) — returns enriched items
cartRoutes.get("/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const [cart] = await db
    .select()
    .from(schema.carts)
    .where(eq(schema.carts.sessionId, sessionId))
    .limit(1);
  if (!cart) return success(c, { items: [] });
  const items = await enrichItems(cart.id);
  return success(c, { cart, items });
});

// Logged-in user's cart
cartRoutes.get("/user/:userId", async (c) => {
  const userId = c.req.param("userId");
  const [cart] = await db
    .select()
    .from(schema.carts)
    .where(eq(schema.carts.userId, userId))
    .limit(1);
  if (!cart) return success(c, { cart: null, items: [] });
  const items = await enrichItems(cart.id);
  return success(c, { cart, items });
});

// Cart summary (count + subtotal) for navbar / profile widgets
cartRoutes.get("/summary/:userId", async (c) => {
  const userId = c.req.param("userId");
  const [cart] = await db
    .select()
    .from(schema.carts)
    .where(eq(schema.carts.userId, userId))
    .limit(1);
  if (!cart) return success(c, { count: 0, subtotal: 0, items: [] });
  const items = await enrichItems(cart.id);
  const count = items.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.discountPrice || it.price) * it.quantity,
    0,
  );
  return success(c, { count, subtotal, items });
});
