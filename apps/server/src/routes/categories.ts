import { Hono } from "hono";
import { db, schema } from "@gadget-wallet/db";
import { eq } from "drizzle-orm";
import { success } from "../utils/response";

export const categoryRoutes = new Hono();

categoryRoutes.get("/", async (c) => {
  const categories = await db.select().from(schema.categories);
  return success(c, categories);
});

categoryRoutes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, slug)).limit(1);
  if (!category) return success(c, null, "Category not found");
  return success(c, category);
});
