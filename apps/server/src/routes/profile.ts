import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, and, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireAuth } from "../middleware/auth.js";
import { success, error } from "../utils/response.js";

export const profileRoutes = new Hono();

profileRoutes.use("*", requireAuth);

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
});

profileRoutes.get("/", async (c) => {
  const user = c.get("user");
  const [defaultAddress] = await db
    .select()
    .from(schema.addresses)
    .where(and(eq(schema.addresses.userId, user.id), eq(schema.addresses.isDefault, true)))
    .limit(1);
  const [ordersResult] = await db
    .select({ value: count() })
    .from(schema.orders)
    .where(eq(schema.orders.userId, user.id));
  const [wishlistResult] = await db
    .select({ value: count() })
    .from(schema.wishlists)
    .where(eq(schema.wishlists.userId, user.id));
  const [reviewsResult] = await db
    .select({ value: count() })
    .from(schema.reviews)
    .where(eq(schema.reviews.userId, user.id));

  return success(c, {
    user,
    defaultAddress: defaultAddress || null,
    stats: {
      orders: ordersResult?.value || 0,
      wishlist: wishlistResult?.value || 0,
      reviews: reviewsResult?.value || 0,
    },
  });
});

profileRoutes.put("/", zValidator("json", updateSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const [updated] = await db
    .update(schema.users)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
      ...(data.avatar !== undefined ? { avatar: data.avatar || null } : {}),
    })
    .where(eq(schema.users.id, user.id))
    .returning({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      isActive: schema.users.isActive,
      twoFactorEnabled: schema.users.twoFactorEnabled,
      phone: schema.users.phone,
      avatar: schema.users.avatar,
      createdAt: schema.users.createdAt,
    });
  return success(c, updated, "Profile updated successfully");
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

profileRoutes.put("/password", zValidator("json", passwordSchema), async (c) => {
  const user = c.get("user");
  const { currentPassword, newPassword } = c.req.valid("json");

  if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return error(c, 400, "Password must include upper & lowercase letters and a number");
  }

  const [dbUser] = await db
    .select({ passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.id, user.id))
    .limit(1);
  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!valid) return error(c, 400, "Current password is incorrect");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, user.id));
  return success(c, null, "Password changed successfully");
});

const twoFactorSchema = z.object({
  enabled: z.boolean(),
});

profileRoutes.put("/two-factor", zValidator("json", twoFactorSchema), async (c) => {
  const user = c.get("user");
  const { enabled } = c.req.valid("json");
  await db
    .update(schema.users)
    .set({ twoFactorEnabled: enabled })
    .where(eq(schema.users.id, user.id));
  return success(c, { twoFactorEnabled: enabled }, enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
});
