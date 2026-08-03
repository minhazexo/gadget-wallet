import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { success, error } from "../utils/response.js";

export const wishlistRoutes = new Hono();

const addSchema = z.object({
  userId: z.string().uuid().optional(),
  productId: z.string().uuid(),
});

async function enrichWishlistItems(userId: string) {
  return db
    .select({
      id: schema.wishlists.id,
      productId: schema.wishlists.productId,
      createdAt: schema.wishlists.createdAt,
      name: schema.products.name,
      slug: schema.products.slug,
      price: schema.products.price,
      discountPrice: schema.products.discountPrice,
      stock: schema.products.stock,
      rating: schema.products.rating,
      reviewCount: schema.products.reviewCount,
      image: sql<string>`(
        SELECT ${schema.productImages.url} FROM ${schema.productImages}
        WHERE ${schema.productImages.productId} = ${schema.wishlists.productId}
        ORDER BY ${schema.productImages.order} ASC LIMIT 1
      )`,
    })
    .from(schema.wishlists)
    .leftJoin(schema.products, eq(schema.wishlists.productId, schema.products.id))
    .where(eq(schema.wishlists.userId, userId));
}

// Current user's wishlist (JWT)
wishlistRoutes.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const items = await enrichWishlistItems(user.id);
  return success(c, items);
});

// Back-compat: wishlist by user id
wishlistRoutes.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const items = await enrichWishlistItems(userId);
  return success(c, items);
});

wishlistRoutes.post("/add", requireAuth, zValidator("json", addSchema), async (c) => {
  const user = c.get("user");
  const { productId } = c.req.valid("json");
  const [existing] = await db
    .select()
    .from(schema.wishlists)
    .where(and(eq(schema.wishlists.userId, user.id), eq(schema.wishlists.productId, productId)))
    .limit(1);
  if (existing) return success(c, null, "Already in wishlist");
  await db.insert(schema.wishlists).values({ userId: user.id, productId });
  return success(c, null, "Added to wishlist");
});

wishlistRoutes.delete("/remove", requireAuth, zValidator("json", addSchema), async (c) => {
  const user = c.get("user");
  const { productId } = c.req.valid("json");
  await db
    .delete(schema.wishlists)
    .where(and(eq(schema.wishlists.userId, user.id), eq(schema.wishlists.productId, productId)));
  return success(c, null, "Removed from wishlist");
});

// Move a wishlist item into the user's cart
wishlistRoutes.post("/move-to-cart", requireAuth, zValidator("json", addSchema), async (c) => {
  const user = c.get("user");
  const { productId } = c.req.valid("json");

  await db
    .delete(schema.wishlists)
    .where(and(eq(schema.wishlists.userId, user.id), eq(schema.wishlists.productId, productId)));

  let [cart] = await db
    .select()
    .from(schema.carts)
    .where(eq(schema.carts.userId, user.id))
    .limit(1);
  if (!cart) {
    [cart] = await db.insert(schema.carts).values({ userId: user.id }).returning();
  }
  const [existing] = await db
    .select()
    .from(schema.cartItems)
    .where(and(eq(schema.cartItems.cartId, cart.id), eq(schema.cartItems.productId, productId)))
    .limit(1);
  if (existing) {
    await db
      .update(schema.cartItems)
      .set({ quantity: existing.quantity + 1 })
      .where(eq(schema.cartItems.id, existing.id));
  } else {
    await db.insert(schema.cartItems).values({ cartId: cart.id, productId, quantity: 1 });
  }
  return success(c, null, "Moved to cart");
});

// Helper used internally by other routes
export async function addToWishlist(userId: string, productId: string) {
  const [existing] = await db
    .select()
    .from(schema.wishlists)
    .where(and(eq(schema.wishlists.userId, userId), eq(schema.wishlists.productId, productId)))
    .limit(1);
  if (!existing) {
    await db.insert(schema.wishlists).values({ userId, productId });
  }
}
