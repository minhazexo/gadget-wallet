import { Hono } from "hono";
import { db, schema } from "@gadget-wallet/db";
import { eq, and, gt } from "drizzle-orm";
import { success, error } from "../utils/response.js";

export const couponRoutes = new Hono();

couponRoutes.get("/validate/:code", async (c) => {
  const code = c.req.param("code").toUpperCase();
  const [coupon] = await db
    .select()
    .from(schema.coupons)
    .where(
      and(
        eq(schema.coupons.code, code),
        eq(schema.coupons.isActive, true),
        gt(schema.coupons.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!coupon) return error(c, 404, "Invalid or expired coupon");
  return success(c, coupon);
});
