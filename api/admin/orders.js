import sql from "../_lib/db.js";
import { requireAdmin } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/** GET /api/admin/orders — latest 20 orders for the admin table. */
export default requireAdmin(async (req, res) => {
  try {
    const orders = await sql.unsafe(`
      SELECT id, status, payment_status AS "paymentStatus", total,
             created_at AS "createdAt", updated_at AS "updatedAt"
      FROM orders ORDER BY created_at DESC LIMIT 20
    `);
    return ok(res, orders);
  } catch (err) {
    console.error("[admin] orders failed:", err);
    return fail(res, 500, "Failed to load orders");
  }
});
