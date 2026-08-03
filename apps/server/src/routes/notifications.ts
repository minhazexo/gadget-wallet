import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";

export const notificationRoutes = new Hono();

notificationRoutes.use("*", requireAuth);

const prefsSchema = z.object({
  orderUpdates: z.boolean().optional(),
  promotional: z.boolean().optional(),
  sms: z.boolean().optional(),
  push: z.boolean().optional(),
});

notificationRoutes.get("/preferences", async (c) => {
  const user = c.get("user");
  const [prefs] = await db
    .select()
    .from(schema.notificationPreferences)
    .where(eq(schema.notificationPreferences.userId, user.id))
    .limit(1);
  return success(
    c,
    prefs || {
      orderUpdates: true,
      promotional: true,
      sms: false,
      push: true,
    },
  );
});

notificationRoutes.put("/preferences", zValidator("json", prefsSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const [existing] = await db
    .select()
    .from(schema.notificationPreferences)
    .where(eq(schema.notificationPreferences.userId, user.id))
    .limit(1);
  if (existing) {
    const [updated] = await db
      .update(schema.notificationPreferences)
      .set({ ...data })
      .where(eq(schema.notificationPreferences.id, existing.id))
      .returning();
    return success(c, updated, "Notification preferences updated");
  }
  const [created] = await db
    .insert(schema.notificationPreferences)
    .values({ userId: user.id, ...data })
    .returning();
  return success(c, created, "Notification preferences updated");
});

notificationRoutes.get("/", async (c) => {
  const user = c.get("user");
  const notifications = await db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, user.id))
    .orderBy(desc(schema.notifications.createdAt));
  return success(c, notifications);
});

notificationRoutes.post("/read-all", async (c) => {
  const user = c.get("user");
  await db
    .update(schema.notifications)
    .set({ isRead: true })
    .where(eq(schema.notifications.userId, user.id));
  return success(c, null, "All notifications marked as read");
});
