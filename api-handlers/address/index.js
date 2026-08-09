import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

const ADDRESS_SELECT = `
  id, label, street, city, state, zip, country,
  is_default AS "isDefault", created_at AS "createdAt"
`;

/** GET /api/address (list) and POST /api/address (create). */
export default requireAuth(async (req, res) => {
  if (req.method === "GET") {
    try {
      const addresses = await sql.unsafe(
        `SELECT ${ADDRESS_SELECT} FROM addresses WHERE user_id = $1 ORDER BY is_default`,
        [req.user.id],
      );
      return ok(res, addresses);
    } catch (err) {
      console.error("[address] list failed:", err);
      return fail(res, 500, "Failed to fetch addresses");
    }
  }

  if (req.method === "POST") {
    const { label, street, city, state, zip, country, isDefault } = req.body || {};
    if (!label || !street || !city || !state || !zip || !country) {
      return fail(res, 400, "label, street, city, state, zip and country are required");
    }

    try {
      const countRows = await sql.unsafe(
        "SELECT count(*)::int AS count FROM addresses WHERE user_id = $1",
        [req.user.id],
      );
      const isFirst = Number(countRows[0]?.count || 0) === 0;
      const makeDefault = isDefault === true || isFirst;

      if (makeDefault) {
        await sql.unsafe("UPDATE addresses SET is_default = false WHERE user_id = $1", [req.user.id]);
      }

      const rows = await sql.unsafe(
        `INSERT INTO addresses (user_id, label, street, city, state, zip, country, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING ${ADDRESS_SELECT}`,
        [req.user.id, label, street, city, state, zip, country, makeDefault],
      );
      return ok(res, rows[0], "Address added successfully");
    } catch (err) {
      console.error("[address] create failed:", err);
      return fail(res, 500, "Failed to add address");
    }
  }

  return res.status(405).end();
});
