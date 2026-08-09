import sql from "./db.js";

// Canonical camelCase aliases for the orders table — must match what the old
// Hono route returned so the frontend keeps working unchanged.
export const ORDER_SELECT = `
  id, user_id AS "userId", status, payment_status AS "paymentStatus",
  total, subtotal, discount, shipping,
  payment_method AS "paymentMethod", shipping_address_id AS "shippingAddressId",
  coupon_id AS "couponId", tracking_number AS "trackingNumber",
  estimated_delivery AS "estimatedDelivery", return_requested_at AS "returnRequestedAt",
  created_at AS "createdAt", updated_at AS "updatedAt"
`;

export const ORDER_ITEM_SELECT = `
  oi.id, oi.product_id AS "productId", oi.quantity, oi.price,
  p.name, p.slug,
  (SELECT pi.url FROM product_images pi
    WHERE pi.product_id = p.id ORDER BY pi."order" ASC LIMIT 1) AS image
`;

export const ADDRESS_SELECT = `
  id, label, street, city, state, zip, country,
  is_default AS "isDefault", created_at AS "createdAt"
`;

/** Enriches an order row with its items (product info) + shipping address. */
export async function enrichOrder(order) {
  const [items, addressRows] = await Promise.all([
    sql.unsafe(
      `SELECT ${ORDER_ITEM_SELECT} FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [order.id],
    ),
    order.shippingAddressId
      ? sql.unsafe(`SELECT ${ADDRESS_SELECT} FROM addresses WHERE id = $1 LIMIT 1`, [
          order.shippingAddressId,
        ])
      : Promise.resolve([]),
  ]);
  return { ...order, items, shippingAddress: addressRows[0] || null };
}
