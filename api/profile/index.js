import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";
import { USER_SELECT } from "../_lib/users.js";

const ADDRESS_SELECT = `
  id, label, street, city, state, zip, country,
  is_default AS "isDefault", created_at AS "createdAt"
`;

/**
 * GET /api/profile → { user, defaultAddress, stats } — matches the old Hono
 * route (Checkout prefills the default address from data.data.defaultAddress,
 * OverviewSection shows the stats).
 * PUT /api/profile { name?, phone?, avatar? } → the updated user (partial).
 */
export default requireAuth(async (req, res) => {
  if (req.method === "GET") {
    try {
      const [addressRows, orderRows, wishlistRows, reviewRows] = await Promise.all([
        sql.unsafe(`SELECT ${ADDRESS_SELECT} FROM addresses WHERE user_id = $1 AND is_default = true LIMIT 1`, [
          req.user.id,
        ]),
        sql.unsafe("SELECT count(*)::int AS count FROM orders WHERE user_id = $1", [req.user.id]),
        sql.unsafe("SELECT count(*)::int AS count FROM wishlists WHERE user_id = $1", [req.user.id]),
        sql.unsafe("SELECT count(*)::int AS count FROM reviews WHERE user_id = $1", [req.user.id]),
      ]);

      return ok(res, {
        user: req.user,
        defaultAddress: addressRows[0] || null,
        stats: {
          orders: Number(orderRows[0]?.count || 0),
          wishlist: Number(wishlistRows[0]?.count || 0),
          reviews: Number(reviewRows[0]?.count || 0),
        },
      });
    } catch (err) {
      console.error("[profile] get failed:", err);
      return fail(res, 500, "Failed to load profile");
    }
  }

  if (req.method === "PUT") {
    const { name, phone, avatar } = req.body || {};
    try {
      const sets = [];
      const params = [];
      const push = (col, val) => {
        params.push(val);
        sets.push(`${col} = $${params.length}`);
      };
      if (typeof name === "string" && name.trim().length >= 2) push("name", name.trim());
      if (phone !== undefined) push("phone", typeof phone === "string" && phone.trim() ? phone.trim() : null);
      if (avatar !== undefined) push("avatar", typeof avatar === "string" && avatar.trim() ? avatar.trim() : null);
      if (sets.length === 0) return fail(res, 400, "Provide name, phone or avatar to update");

      params.push(req.user.id);
      const rows = await sql.unsafe(
        `UPDATE users SET ${sets.join(", ")}, updated_at = NOW()
         WHERE id = $${params.length} RETURNING ${USER_SELECT}`,
        params,
      );
      return ok(res, rows[0], "Profile updated successfully");
    } catch (err) {
      console.error("[profile] update failed:", err);
      return fail(res, 500, "Failed to update profile");
    }
  }

  return res.status(405).end();
});
