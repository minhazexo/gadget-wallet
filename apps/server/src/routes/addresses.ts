import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { success, error } from "../utils/response.js";

export const addressRoutes = new Hono();

addressRoutes.use("*", requireAuth);

const addressSchema = z.object({
  label: z.string().min(1),
  street: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(1),
  zip: z.string().min(2),
  country: z.string().min(2),
  isDefault: z.boolean().optional(),
});

addressRoutes.get("/", async (c) => {
  const user = c.get("user");
  const addresses = await db
    .select()
    .from(schema.addresses)
    .where(eq(schema.addresses.userId, user.id))
    .orderBy(schema.addresses.isDefault);
  return success(c, addresses);
});

addressRoutes.post("/", zValidator("json", addressSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");

  const [existingCount] = await db
    .select({ value: count() })
    .from(schema.addresses)
    .where(eq(schema.addresses.userId, user.id));
  const isFirst = (existingCount?.value || 0) === 0;
  const makeDefault = data.isDefault || isFirst;

  if (makeDefault) {
    await db
      .update(schema.addresses)
      .set({ isDefault: false })
      .where(eq(schema.addresses.userId, user.id));
  }

  const [address] = await db
    .insert(schema.addresses)
    .values({ ...data, userId: user.id, isDefault: makeDefault })
    .returning();
  return success(c, address, "Address added successfully");
});

const updateSchema = addressSchema.partial();

addressRoutes.put("/:id", zValidator("json", updateSchema), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const data = c.req.valid("json");

  const [existing] = await db
    .select()
    .from(schema.addresses)
    .where(and(eq(schema.addresses.id, id), eq(schema.addresses.userId, user.id)))
    .limit(1);
  if (!existing) return error(c, 404, "Address not found");

  if (data.isDefault) {
    await db
      .update(schema.addresses)
      .set({ isDefault: false })
      .where(eq(schema.addresses.userId, user.id));
  }

  const [updated] = await db
    .update(schema.addresses)
    .set({ ...data })
    .where(eq(schema.addresses.id, id))
    .returning();
  return success(c, updated, "Address updated successfully");
});

addressRoutes.post("/:id/default", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [existing] = await db
    .select()
    .from(schema.addresses)
    .where(and(eq(schema.addresses.id, id), eq(schema.addresses.userId, user.id)))
    .limit(1);
  if (!existing) return error(c, 404, "Address not found");

  await db
    .update(schema.addresses)
    .set({ isDefault: false })
    .where(eq(schema.addresses.userId, user.id));
  await db.update(schema.addresses).set({ isDefault: true }).where(eq(schema.addresses.id, id));
  return success(c, null, "Default address updated");
});

addressRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [existing] = await db
    .select()
    .from(schema.addresses)
    .where(and(eq(schema.addresses.id, id), eq(schema.addresses.userId, user.id)))
    .limit(1);
  if (!existing) return error(c, 404, "Address not found");

  await db.delete(schema.addresses).where(eq(schema.addresses.id, id));

  if (existing.isDefault) {
    const [next] = await db
      .select()
      .from(schema.addresses)
      .where(eq(schema.addresses.userId, user.id))
      .limit(1);
    if (next) {
      await db.update(schema.addresses).set({ isDefault: true }).where(eq(schema.addresses.id, next.id));
    }
  }
  return success(c, null, "Address deleted successfully");
});
