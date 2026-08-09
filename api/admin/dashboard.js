import sql from "../_lib/db.js";
import { requireAdmin } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/** GET /api/admin/dashboard — stat cards for the admin dashboard. */
export default requireAdmin(async (req, res) => {
  try {
    const [products] = await sql.unsafe(
      "SELECT count(*)::int AS count FROM products WHERE deleted_at IS NULL",
    );
    const [orders] = await sql.unsafe("SELECT count(*)::int AS count FROM orders");
    const [users] = await sql.unsafe("SELECT count(*)::int AS count FROM users");
    const [revenue] = await sql.unsafe(
      "SELECT COALESCE(SUM(total), 0)::float8 AS total FROM orders WHERE status = 'delivered'",
    );
    return ok(res, {
      totalProducts: Number(products?.count || 0),
      totalOrders: Number(orders?.count || 0),
      totalUsers: Number(users?.count || 0),
      revenue: Number(revenue?.total || 0),
    });
  } catch (err) {
    console.error("[admin] dashboard failed:", err);
    return fail(res, 500, "Failed to load dashboard stats");
  }
});
