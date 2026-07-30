import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwtLib from "jsonwebtoken";
import { generateToken } from "../middleware/auth";
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
    .returning({ id: schema.users.id, email: schema.users.email, name: schema.users.name, role: schema.users.role });
  const token = generateToken(user);
  return success(c, { user, token }, "Registration successful");
});

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!user) return error(c, 401, "Invalid credentials");
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return error(c, 401, "Invalid credentials");
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return success(c, { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token }, "Login successful");
});

authRoutes.get("/me", async (c) => {
  const auth = c.req.header("Authorization");
  if (!auth) return error(c, 401, "Not authenticated");
  try {
    const payload = jwtLib.verify(auth.replace("Bearer ", ""), process.env.JWT_SECRET || "dev-secret-change-in-production") as any;
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, payload.id)).limit(1);
    if (!user) return error(c, 404, "User not found");
    return success(c, { id: user.id, email: user.email, name: user.name, role: user.role });
  } catch {
    return error(c, 401, "Invalid token");
  }
});
