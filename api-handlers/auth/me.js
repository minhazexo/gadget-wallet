import { requireAuth } from "../_lib/auth.js";
import { ok } from "../_lib/respond.js";

/** GET /api/auth/me — returns the authenticated user (from the DB, fresh). */
export default requireAuth(async (req, res) => {
  return ok(res, req.user);
});
