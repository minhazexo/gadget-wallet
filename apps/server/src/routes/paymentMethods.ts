import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { success, error } from "../utils/response.js";

export const paymentMethodRoutes = new Hono();

paymentMethodRoutes.use("*", requireAuth);

const cardSchema = z.object({
  type: z.literal("card"),
  brand: z.string().min(1),
  last4: z.string().regex(/^\d{4}$/, "Must be the last 4 digits"),
  holderName: z.string().min(2),
  expiryMonth: z.string().regex(/^\d{2}$/),
  expiryYear: z.string().regex(/^\d{4}$/),
  isDefault: z.boolean().optional(),
});

const mobileBankingSchema = z.object({
  type: z.literal("mobile_banking"),
  provider: z.string().min(1),
  last4: z.string().regex(/^\d{4}$/, "Must be the last 4 digits"),
  holderName: z.string().min(2),
  isDefault: z.boolean().optional(),
});

const codSchema = z.object({
  type: z.literal("cash_on_delivery"),
  isDefault: z.boolean().optional(),
});

paymentMethodRoutes.get("/", async (c) => {
  const user = c.get("user");
  const methods = await db
    .select()
    .from(schema.paymentMethods)
    .where(eq(schema.paymentMethods.userId, user.id))
    .orderBy(schema.paymentMethods.isDefault);
  return success(c, methods);
});

paymentMethodRoutes.post(
  "/",
  zValidator("json", z.discriminatedUnion("type", [cardSchema, mobileBankingSchema, codSchema])),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("json");

    const [existingCount] = await db
      .select({ value: count() })
      .from(schema.paymentMethods)
      .where(eq(schema.paymentMethods.userId, user.id));
    const isFirst = (existingCount?.value || 0) === 0;
    const makeDefault = data.isDefault || isFirst;

    if (makeDefault) {
      await db
        .update(schema.paymentMethods)
        .set({ isDefault: false })
        .where(eq(schema.paymentMethods.userId, user.id));
    }

    const [method] = await db
      .insert(schema.paymentMethods)
      .values({ ...data, userId: user.id, isDefault: makeDefault })
      .returning();
    return success(c, method, "Payment method added successfully");
  },
);

paymentMethodRoutes.post("/:id/default", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [existing] = await db
    .select()
    .from(schema.paymentMethods)
    .where(and(eq(schema.paymentMethods.id, id), eq(schema.paymentMethods.userId, user.id)))
    .limit(1);
  if (!existing) return error(c, 404, "Payment method not found");

  await db
    .update(schema.paymentMethods)
    .set({ isDefault: false })
    .where(eq(schema.paymentMethods.userId, user.id));
  await db.update(schema.paymentMethods).set({ isDefault: true }).where(eq(schema.paymentMethods.id, id));
  return success(c, null, "Default payment method updated");
});

paymentMethodRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [existing] = await db
    .select()
    .from(schema.paymentMethods)
    .where(and(eq(schema.paymentMethods.id, id), eq(schema.paymentMethods.userId, user.id)))
    .limit(1);
  if (!existing) return error(c, 404, "Payment method not found");

  await db.delete(schema.paymentMethods).where(eq(schema.paymentMethods.id, id));
  return success(c, null, "Payment method removed successfully");
});
