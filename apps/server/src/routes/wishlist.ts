import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, and } from "drizzle-orm";
import { success, error } from "../utils/response";

export const wishlistRoutes = new Hono();

const addSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
});

wishlistRoutes.post("/add", zValidator("json", addSchema), async (c) => {
  const { userId, productId } = c.req.valid("json");
  const [existing] = await db
    .select()
    .from(schema.wishlists)
    .where(and(eq(schema.wishlists.userId, userId), eq(schema.wishlists.productId, productId)))
    .limit(1);
  if (existing) return success(c, null, "Already in wishlist");
  await db.insert(schema.wishlists).values({ userId, productId });
  return success(c, null, "Added to wishlist");
});

wishlistRoutes.delete("/remove", zValidator("json", addSchema), async (c) => {
  const { userId, productId } = c.req.valid("json");
  await db
    .delete(schema.wishlists)
    .where(and(eq(schema.wishlists.userId, userId), eq(schema.wishlists.productId, productId)));
  return success(c, null, "Removed from wishlist");
});

wishlistRoutes.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const items = await db
    .select()
    .from(schema.wishlists)
    .where(eq(schema.wishlists.userId, userId));
  return success(c, items);
});
