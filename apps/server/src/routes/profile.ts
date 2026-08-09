import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, and, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireAuth } from "../middleware/auth.js";
import { success, error } from "../utils/response.js";
import { uploadImage, deleteImage, isAllowedImage } from "../utils/storage.js";

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

/**
 * POST /api/profile/avatar — multipart upload of a profile photo.
 * Same flow as the admin product image upload: file → storage (Supabase in
 * prod, local disk in dev) → users.avatar public URL.
 */
profileRoutes.post("/avatar", async (c) => {
  const user = c.get("user");
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    if (!file || typeof file === "string") return error(c, 400, "No image file provided");
    if (!isAllowedImage(file)) {
      return error(c, 400, "Invalid image. Allowed types: JPG, PNG, WEBP (max 5MB).");
    }

    // products/avatars/{userId}/{file} — distinct from product images.
    const { url } = await uploadImage(file, `avatars/${user.id}`);

    // Persist first so a failed write never loses the old avatar.
    const [updated] = await db
      .update(schema.users)
      .set({ avatar: url, updatedAt: new Date() })
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

    // Free the old avatar, but ONLY when it is one of ours (products/avatars/…)
    // — deleteImage() would otherwise remove any owned storage path, and a
    // user whose avatar was set to a product image URL via PUT /api/profile
    // could wipe that image by uploading a new photo.
    const [current] = await db
      .select({ avatar: schema.users.avatar })
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);
    if (current?.avatar && current.avatar.includes("/products/avatars/")) {
      await deleteImage(current.avatar).catch(() => {});
    }

    return success(c, updated, "Avatar updated successfully");
  } catch (err) {
    console.error("[profile] avatar upload failed:", err);
    return error(c, 500, "Failed to upload avatar");
  }
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
