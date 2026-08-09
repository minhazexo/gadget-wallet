import bcrypt from "bcryptjs";
import sql from "../_lib/db.js";
import { ok, fail } from "../_lib/respond.js";
import { signToken } from "../_lib/auth.js";
import { USER_SELECT } from "../_lib/users.js";

/**
 * POST /api/auth/login { email, password }
 * Selects the canonical camelCase user columns (like register/me/profile) so
 * the returned user matches the frontend's AuthUser shape, and so signToken
 * reads the real tokenVersion (a `SELECT *` would make it undefined → tok:0,
 * which breaks re-login after logout-all bumps token_version). `password_hash`
 * is fetched separately and stripped before responding.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return fail(res, 400, "Email and password are required");

  try {
    const rows = await sql.unsafe(
      `SELECT ${USER_SELECT}, password_hash FROM users WHERE email = $1 LIMIT 1`,
      [email],
    );
    const user = rows[0];
    if (!user) return fail(res, 401, "Invalid credentials");
    if (!user.isActive) return fail(res, 403, "Account is disabled");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return fail(res, 401, "Invalid credentials");

    const token = signToken(user);
    const { password_hash, ...safe } = user;
    return ok(res, { user: safe, token }, "Login successful");
  } catch (err) {
    console.error("[auth] login failed:", err);
    return fail(res, 500, "Login failed");
  }
}
