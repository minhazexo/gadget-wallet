import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

const PAYMENT_METHOD_SELECT = `
  id, type, brand, last4, holder_name AS "holderName",
  expiry_month AS "expiryMonth", expiry_year AS "expiryYear", provider,
  is_default AS "isDefault", created_at AS "createdAt"
`;

/** GET /api/payment-methods and POST /api/payment-methods. */
export default requireAuth(async (req, res) => {
  if (req.method === "GET") {
    try {
      const methods = await sql.unsafe(
        `SELECT ${PAYMENT_METHOD_SELECT} FROM payment_methods WHERE user_id = $1 ORDER BY is_default`,
        [req.user.id],
      );
      return ok(res, methods);
    } catch (err) {
      console.error("[payment-methods] list failed:", err);
      return fail(res, 500, "Failed to fetch payment methods");
    }
  }

  if (req.method === "POST") {
    const data = req.body || {};
    const { type, isDefault } = data;

    if (!["card", "mobile_banking", "cash_on_delivery"].includes(type)) {
      return fail(res, 400, "type must be card, mobile_banking or cash_on_delivery");
    }
    if (type === "card") {
      if (!data.brand || !/^\d{4}$/.test(data.last4 || "") || !data.holderName || !/^\d{2}$/.test(data.expiryMonth || "") || !/^\d{4}$/.test(data.expiryYear || "")) {
        return fail(res, 400, "Card requires brand, last4, holderName, expiryMonth (MM) and expiryYear (YYYY)");
      }
    }
    if (type === "mobile_banking") {
      if (!data.provider || !/^\d{4}$/.test(data.last4 || "") || !data.holderName) {
        return fail(res, 400, "Mobile banking requires provider, last4 and holderName");
      }
    }

    try {
      const countRows = await sql.unsafe(
        "SELECT count(*)::int AS count FROM payment_methods WHERE user_id = $1",
        [req.user.id],
      );
      const isFirst = Number(countRows[0]?.count || 0) === 0;
      const makeDefault = isDefault === true || isFirst;

      if (makeDefault) {
        await sql.unsafe("UPDATE payment_methods SET is_default = false WHERE user_id = $1", [req.user.id]);
      }

      const rows = await sql.unsafe(
        `INSERT INTO payment_methods (user_id, type, brand, last4, holder_name, expiry_month, expiry_year, provider, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING ${PAYMENT_METHOD_SELECT}`,
        [
          req.user.id,
          type,
          data.brand || null,
          data.last4 || null,
          data.holderName || null,
          data.expiryMonth || null,
          data.expiryYear || null,
          data.provider || null,
          makeDefault,
        ],
      );
      return ok(res, rows[0], "Payment method added successfully");
    } catch (err) {
      console.error("[payment-methods] create failed:", err);
      return fail(res, 500, "Failed to add payment method");
    }
  }

  return res.status(405).end();
});
