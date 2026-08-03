import { Hono } from "hono";
import { db, schema } from "@gadget-wallet/db";
import { eq, count } from "drizzle-orm";
import { success } from "../utils/response.js";

export const categoryRoutes = new Hono();

categoryRoutes.get("/", async (c) => {
  const categories = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      slug: schema.categories.slug,
      description: schema.categories.description,
      image: schema.categories.image,
      parentId: schema.categories.parentId,
      count: count(schema.products.id),
    })
    .from(schema.categories)
    .leftJoin(schema.products, eq(schema.products.categoryId, schema.categories.id))
    .groupBy(schema.categories.id, schema.categories.name, schema.categories.slug, schema.categories.description, schema.categories.image, schema.categories.parentId);
  return success(c, categories);
});

categoryRoutes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, slug)).limit(1);
  if (!category) return success(c, null, "Category not found");
  return success(c, category);
});
