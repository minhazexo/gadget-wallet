import jwt from "jsonwebtoken";
import sql from "./db.js";
import { fail } from "./respond.js";
import { USER_SELECT } from "./users.js";

// Matches apps/server/src/middleware/auth.ts: same payload, same secret, HS256.
// Fail loudly in production if JWT_SECRET is missing or a placeholder (see
// .env.example) — a silently-forgeable default secret would be a security hole.
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || /your-/.test(secret)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is not configured. Set a real value in the Vercel environment.");
    }
    return "dev-secret-change-in-production";
  }
  return secret;
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, tok: user.tokenVersion || 0 },
    getJwtSecret(),
    { expiresIn: "7d", algorithm: "HS256" },
  );
}

export function getBearer(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

/**
 * Auth + role guard for /api/admin/*. A valid JWT whose payload.role is
 * "admin" (from either POST /api/auth/login for a users-table admin, or
 * POST /api/admin/login using ADMIN_EMAIL/ADMIN_PASSWORD).
 */
export function requireAdmin(handler) {
  return async (req, res) => {
    const payload = verifyToken(getBearer(req));
    if (!payload) return fail(res, 401, "Invalid or expired token");
    if (payload.role !== "admin") return fail(res, 403, "Unauthorized - Admin access required");
    req.user = payload;
    return handler(req, res);
  };
}

/**
 * Auth guard that also re-checks the user against the DB (exists, active,
 * tokenVersion matches) — mirrors the old requireAuth middleware.
 */
export function requireAuth(handler) {
  return async (req, res) => {
    const token = getBearer(req);
    if (!token) return fail(res, 401, "Not authenticated");
    const payload = verifyToken(token);
    if (!payload) return fail(res, 401, "Invalid or expired token");
    try {
      const rows = await sql.unsafe(
        `SELECT ${USER_SELECT} FROM users WHERE id = $1 LIMIT 1`,
        [payload.id],
      );
      const user = rows[0];
      if (!user || !user.isActive) return fail(res, 401, "Account is disabled");
      if (user.tokenVersion !== (payload.tok || 0)) {
        return fail(res, 401, "Session expired, please sign in again");
      }
      req.user = user;
      return handler(req, res);
    } catch (err) {
      console.error("[auth] requireAuth lookup failed:", err);
      return fail(res, 500, "Failed to load user");
    }
  };
}
