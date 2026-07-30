import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, desc } from "drizzle-orm";
import { success } from "../utils/response";

export const reviewRoutes = new Hono();

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().min(2),
  comment: z.string().min(10),
});

reviewRoutes.post("/", zValidator("json", createReviewSchema), async (c) => {
  const data = c.req.valid("json");
  const [review] = await db.insert(schema.reviews).values(data).returning();
  return success(c, review, "Review submitted");
});

reviewRoutes.get("/product/:productId", async (c) => {
  const productId = c.req.param("productId");
  const reviews = await db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.productId, productId))
    .orderBy(desc(schema.reviews.createdAt));
  return success(c, reviews);
});
