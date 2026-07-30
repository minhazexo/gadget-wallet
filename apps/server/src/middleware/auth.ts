import { jwt } from "hono/jwt";
import type { Context, Next } from "hono";
import jwtLib from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export const authMiddleware = jwt({ secret: JWT_SECRET, alg: "HS256" });

export const adminMiddleware = async (c: Context, next: Next) => {
  const payload = c.get("jwtPayload");
  if (!payload || payload.role !== "admin") {
    return c.json({ success: false, error: "Unauthorized - Admin access required" }, 403);
  }
  await next();
};

export function generateToken(user: { id: string; email: string; role: string }) {
  return jwtLib.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256",
  });
}
