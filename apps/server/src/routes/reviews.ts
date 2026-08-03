import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { success, error } from "../utils/response.js";

export const reviewRoutes = new Hono();

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().min(2),
  comment: z.string().min(5),
});

const updateReviewSchema = createReviewSchema.partial();

// Current user's reviews with product info
reviewRoutes.get("/user", requireAuth, async (c) => {
  const user = c.get("user");
  const reviews = await db
    .select({
      id: schema.reviews.id,
      rating: schema.reviews.rating,
      title: schema.reviews.title,
      comment: schema.reviews.comment,
      isApproved: schema.reviews.isApproved,
      createdAt: schema.reviews.createdAt,
      productId: schema.reviews.productId,
      productName: schema.products.name,
      productSlug: schema.products.slug,
      productImage: sql<string>`(
        SELECT ${schema.productImages.url} FROM ${schema.productImages}
        WHERE ${schema.productImages.productId} = ${schema.reviews.productId}
        ORDER BY ${schema.productImages.order} ASC LIMIT 1
      )`,
    })
    .from(schema.reviews)
    .leftJoin(schema.products, eq(schema.reviews.productId, schema.products.id))
    .where(eq(schema.reviews.userId, user.id))
    .orderBy(desc(schema.reviews.createdAt));
  return success(c, reviews);
});

reviewRoutes.post("/", requireAuth, zValidator("json", createReviewSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const [review] = await db
    .insert(schema.reviews)
    .values({ ...data, userId: user.id } as typeof schema.reviews.$inferInsert)
    .returning();
  return success(c, review, "Review submitted");
});

reviewRoutes.put("/:id", requireAuth, zValidator("json", updateReviewSchema), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const data = c.req.valid("json");

  const [existing] = await db
    .select()
    .from(schema.reviews)
    .where(and(eq(schema.reviews.id, id), eq(schema.reviews.userId, user.id)))
    .limit(1);
  if (!existing) return error(c, 404, "Review not found");

  const [updated] = await db
    .update(schema.reviews)
    .set({ ...data })
    .where(eq(schema.reviews.id, id))
    .returning();
  return success(c, updated, "Review updated successfully");
});

reviewRoutes.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [existing] = await db
    .select()
    .from(schema.reviews)
    .where(and(eq(schema.reviews.id, id!), eq(schema.reviews.userId, user.id)))
    .limit(1);
  if (!existing) return error(c, 404, "Review not found");
  await db.delete(schema.reviews).where(eq(schema.reviews.id, id!));
  return success(c, null, "Review deleted successfully");
});

reviewRoutes.get("/product/:productId", async (c) => {
  const productId = c.req.param("productId");
  const reviews = await db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.productId, productId!))
    .orderBy(desc(schema.reviews.createdAt));
  return success(c, reviews);
});
