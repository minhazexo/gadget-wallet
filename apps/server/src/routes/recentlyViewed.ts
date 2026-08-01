import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { success } from "../utils/response";

export const recentlyViewedRoutes = new Hono();

recentlyViewedRoutes.use("*", requireAuth);

const addSchema = z.object({
  productId: z.string().uuid(),
});

recentlyViewedRoutes.get("/", async (c) => {
  const user = c.get("user");
  const items = await db
    .select({
      id: schema.recentlyViewed.id,
      productId: schema.recentlyViewed.productId,
      viewedAt: schema.recentlyViewed.viewedAt,
      name: schema.products.name,
      slug: schema.products.slug,
      price: schema.products.price,
      discountPrice: schema.products.discountPrice,
      stock: schema.products.stock,
      image: sql<string>`(
        SELECT ${schema.productImages.url} FROM ${schema.productImages}
        WHERE ${schema.productImages.productId} = ${schema.recentlyViewed.productId}
        ORDER BY ${schema.productImages.order} ASC LIMIT 1
      )`,
    })
    .from(schema.recentlyViewed)
    .leftJoin(schema.products, eq(schema.recentlyViewed.productId, schema.products.id))
    .where(eq(schema.recentlyViewed.userId, user.id))
    .orderBy(desc(schema.recentlyViewed.viewedAt))
    .limit(12);
  return success(c, items);
});

recentlyViewedRoutes.post("/", zValidator("json", addSchema), async (c) => {
  const user = c.get("user");
  const { productId } = c.req.valid("json");
  const [existing] = await db
    .select()
    .from(schema.recentlyViewed)
    .where(and(eq(schema.recentlyViewed.userId, user.id), eq(schema.recentlyViewed.productId, productId)))
    .limit(1);
  if (existing) {
    await db
      .update(schema.recentlyViewed)
      .set({ viewedAt: new Date() })
      .where(eq(schema.recentlyViewed.id, existing.id));
  } else {
    await db.insert(schema.recentlyViewed).values({ userId: user.id, productId });
  }
  // Trim to the most recent 12
  const older = await db
    .select({ id: schema.recentlyViewed.id })
    .from(schema.recentlyViewed)
    .where(eq(schema.recentlyViewed.userId, user.id))
    .orderBy(desc(schema.recentlyViewed.viewedAt))
    .offset(12);
  for (const item of older) {
    await db.delete(schema.recentlyViewed).where(eq(schema.recentlyViewed.id, item.id));
  }
  return success(c, null, "Added to recently viewed");
});
