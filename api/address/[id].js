import sql from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { ok, fail } from "../_lib/respond.js";

const ADDRESS_SELECT = `
  id, label, street, city, state, zip, country,
  is_default AS "isDefault", created_at AS "createdAt"
`;

/** PUT /api/address/:id (partial update) and DELETE /api/address/:id. */
export default requireAuth(async (req, res) => {
  const id = req.query.id;
  if (!id) return fail(res, 400, "Address id is required");

  try {
    const existing = await sql.unsafe(
      "SELECT * FROM addresses WHERE id = $1 AND user_id = $2 LIMIT 1",
      [id, req.user.id],
    );
    const address = existing[0];
    if (!address) return fail(res, 404, "Address not found");

    if (req.method === "PUT") {
      const { label, street, city, state, zip, country, isDefault } = req.body || {};

      // Only update fields that were actually sent (partial update semantics).
      const sets = [];
      const params = [];
      const push = (col, val) => {
        params.push(val);
        sets.push(`${col} = $${params.length}`);
      };
      if (label !== undefined) push("label", String(label));
      if (street !== undefined) push("street", String(street));
      if (city !== undefined) push("city", String(city));
      if (state !== undefined) push("state", String(state));
      if (zip !== undefined) push("zip", String(zip));
      if (country !== undefined) push("country", String(country));

      if (isDefault === true && !address.is_default) {
        await sql.unsafe("UPDATE addresses SET is_default = false WHERE user_id = $1", [req.user.id]);
        push("is_default", true);
      } else if (isDefault === false) {
        push("is_default", false);
      }

      if (sets.length === 0) return fail(res, 400, "Nothing to update");

      params.push(id);
      const rows = await sql.unsafe(
        `UPDATE addresses SET ${sets.join(", ")} WHERE id = $${params.length}
         RETURNING ${ADDRESS_SELECT}`,
        params,
      );
      return ok(res, rows[0], "Address updated successfully");
    }

    if (req.method === "DELETE") {
      await sql.unsafe("DELETE FROM addresses WHERE id = $1", [id]);

      // If the deleted address was the default, promote another one.
      if (address.is_default) {
        const next = await sql.unsafe(
          "SELECT id FROM addresses WHERE user_id = $1 ORDER BY is_default LIMIT 1",
          [req.user.id],
        );
        if (next[0]) {
          await sql.unsafe("UPDATE addresses SET is_default = true WHERE id = $1", [next[0].id]);
        }
      }
      return ok(res, null, "Address deleted successfully");
    }

    return res.status(405).end();
  } catch (err) {
    console.error("[address] operation failed:", err);
    return fail(res, 500, "Failed to update address");
  }
});
