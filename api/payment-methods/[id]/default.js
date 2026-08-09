import sql from "../../_lib/db.js";
import { requireAuth } from "../../_lib/auth.js";
import { ok, fail } from "../../_lib/respond.js";

/** POST /api/payment-methods/:id/default — set the user's default payment method. */
export default requireAuth(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const id = req.query.id;
  if (!id) return fail(res, 400, "Payment method id is required");

  try {
    const existing = await sql.unsafe(
      "SELECT id FROM payment_methods WHERE id = $1 AND user_id = $2 LIMIT 1",
      [id, req.user.id],
    );
    if (!existing[0]) return fail(res, 404, "Payment method not found");

    await sql.unsafe("UPDATE payment_methods SET is_default = false WHERE user_id = $1", [req.user.id]);
    await sql.unsafe("UPDATE payment_methods SET is_default = true WHERE id = $1", [id]);
    return ok(res, null, "Default payment method updated");
  } catch (err) {
    console.error("[payment-methods] set default failed:", err);
    return fail(res, 500, "Failed to update default payment method");
  }
});
