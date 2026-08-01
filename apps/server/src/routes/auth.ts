import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateToken, requireAuth } from "../middleware/auth";
import { success, error } from "../utils/response";

export const authRoutes = new Hono();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRoutes.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, name, password } = c.req.valid("json");
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing.length) return error(c, 409, "Email already registered");
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(schema.users)
    .values({ email, name, passwordHash })
    .returning({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      tokenVersion: schema.users.tokenVersion,
      isActive: schema.users.isActive,
      twoFactorEnabled: schema.users.twoFactorEnabled,
      phone: schema.users.phone,
      avatar: schema.users.avatar,
      createdAt: schema.users.createdAt,
    });
  const token = generateToken(user);
  return success(c, { user, token }, "Registration successful");
});

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!user) return error(c, 401, "Invalid credentials");
  if (!user.isActive) return error(c, 403, "Account is disabled");
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return error(c, 401, "Invalid credentials");
  const token = generateToken(user);
  return success(
    c,
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tokenVersion: user.tokenVersion,
        isActive: user.isActive,
        twoFactorEnabled: user.twoFactorEnabled,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    },
    "Login successful",
  );
});

authRoutes.get("/me", requireAuth, async (c) => {
  const user = c.get("user");
  return success(c, user);
});

// Invalidates every issued session by bumping the token version
authRoutes.post("/logout-all", requireAuth, async (c) => {
  const user = c.get("user");
  await db
    .update(schema.users)
    .set({ tokenVersion: (user.tokenVersion || 0) + 1 })
    .where(eq(schema.users.id, user.id));
  return success(c, null, "Logged out from all devices");
});
