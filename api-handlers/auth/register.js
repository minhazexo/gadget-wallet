import bcrypt from "bcryptjs";
import sql from "../_lib/db.js";
import { ok, fail } from "../_lib/respond.js";
import { signToken } from "../_lib/auth.js";
import { USER_SELECT } from "../_lib/users.js";

/** POST /api/auth/register { email, name, password } */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name, password } = req.body || {};
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail(res, 400, "Invalid email");
  if (!name || name.length < 2) return fail(res, 400, "Name must be at least 2 characters");
  if (!password || password.length < 6) return fail(res, 400, "Password must be at least 6 characters");

  try {
    const existing = await sql.unsafe("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (existing.length) return fail(res, 409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 10);
    const rows = await sql.unsafe(
      `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)
       RETURNING ${USER_SELECT}`,
      [email, name, passwordHash],
    );
    const user = rows[0];
    const token = signToken(user);
    return ok(res, { user, token }, "Registration successful");
  } catch (err) {
    console.error("[auth] register failed:", err);
    return fail(res, 500, "Registration failed");
  }
}
