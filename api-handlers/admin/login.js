import jwt from "jsonwebtoken";
import { ok, fail } from "../_lib/respond.js";
import { getJwtSecret } from "../_lib/auth.js";

/**
 * Guide step 7 — admin login against ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 * (The app's primary admin flow is users-table admins via POST /api/auth/login;
 * this endpoint exists for the guide's env-based admin auth.)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body || {};
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { id: "admin", email, role: "admin", tok: 0 },
      getJwtSecret(),
      { expiresIn: "7d", algorithm: "HS256" },
    );
    return ok(res, { token, email }, "Admin login successful");
  }

  return fail(res, 401, "Invalid credentials");
}
