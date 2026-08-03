import { Hono } from "hono";
import { db, schema } from "@gadget-wallet/db";
import { eq } from "drizzle-orm";
import { success } from "../utils/response.js";

export const brandRoutes = new Hono();

brandRoutes.get("/", async (c) => {
  const brands = await db.select().from(schema.brands);
  return success(c, brands);
});

brandRoutes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [brand] = await db.select().from(schema.brands).where(eq(schema.brands.slug, slug)).limit(1);
  if (!brand) return success(c, null, "Brand not found");
  return success(c, brand);
});
