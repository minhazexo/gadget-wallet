import { jwt } from "hono/jwt";
import type { Context, Next } from "hono";
import jwtLib from "jsonwebtoken";
import { db, schema } from "@gadget-wallet/db";
import { eq } from "drizzle-orm";
import { error } from "../utils/response";

// JWT_SECRET is required in production — silently falling back to the dev
// secret on Vercel would let anyone forge admin tokens.
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production (generate with: openssl rand -hex 32)");
  }
  console.warn("[auth] JWT_SECRET not set — using dev fallback secret (do not use in production)");
}
const JWT_SECRET = jwtSecret || "dev-secret-change-in-production";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  tokenVersion: number;
  avatar: string | null;
  phone: string | null;
  createdAt: Date;
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

export const authMiddleware = jwt({ secret: JWT_SECRET, alg: "HS256" });

export const adminMiddleware = async (c: Context, next: Next) => {
  const payload = c.get("jwtPayload") as any;
  if (!payload || payload.role !== "admin") {
    return c.json({ success: false, error: "Unauthorized - Admin access required" }, 403);
  }
  await next();
};

// Verifies JWT, checks the user still exists + token version matches
// (logout-from-all-devices bumps tokenVersion), then stores the user on context.
export const requireAuth = async (c: Context, next: Next) => {
  const auth = c.req.header("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return error(c, 401, "Not authenticated");
  }
  try {
    const payload = jwtLib.verify(auth.replace("Bearer ", ""), JWT_SECRET) as any;
    const [user] = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        role: schema.users.role,
        isActive: schema.users.isActive,
        tokenVersion: schema.users.tokenVersion,
        avatar: schema.users.avatar,
        phone: schema.users.phone,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.id, payload.id))
      .limit(1);
    if (!user || !user.isActive) return error(c, 401, "Account is disabled");
    if (user.tokenVersion !== (payload.tok || 0)) return error(c, 401, "Session expired, please sign in again");
    c.set("user", user);
    await next();
  } catch {
    return error(c, 401, "Invalid or expired token");
  }
};

export function generateToken(user: { id: string; email: string; role: string; tokenVersion?: number }) {
  return jwtLib.sign(
    { id: user.id, email: user.email, role: user.role, tok: user.tokenVersion || 0 },
    JWT_SECRET,
    { expiresIn: "7d", algorithm: "HS256" },
  );
}
