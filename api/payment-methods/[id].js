import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

/** DELETE /api/payment-methods/:id */
export default requireAuth(async (req, res) => {
  if (req.method !== "DELETE") return res.status(405).end();
  const id = req.query.id;
  if (!id) return fail(res, 400, "Payment method id is required");

  try {
    const existing = await sql.unsafe(
      "SELECT id FROM payment_methods WHERE id = $1 AND user_id = $2 LIMIT 1",
      [id, req.user.id],
    );
    if (!existing[0]) return fail(res, 404, "Payment method not found");

    await sql.unsafe("DELETE FROM payment_methods WHERE id = $1", [id]);
    return ok(res, null, "Payment method removed successfully");
  } catch (err) {
    console.error("[payment-methods] delete failed:", err);
    return fail(res, 500, "Failed to remove payment method");
  }
});
