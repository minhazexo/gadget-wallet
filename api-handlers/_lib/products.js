// Shared product column selectors (camelCase → the snake_case columns in the
// existing Drizzle products table). Raw SQL because these are serverless
// functions per the guide; aliasing keeps frontend payloads identical to the
// old Hono API.

export const PRODUCT_SELECT = `
  p.id, p.name, p.slug,
  p.short_description AS "shortDescription",
  p.full_description AS "fullDescription",
  p.price, p.discount_price AS "discountPrice",
  p.sku, p.brand_id AS "brandId", p.category_id AS "categoryId",
  p.stock, p.thumbnail_url AS "thumbnailUrl", p.video_url AS "videoUrl",
  p.rating, p.review_count AS "reviewCount",
  p.is_featured AS "isFeatured", p.is_new_arrival AS "isNewArrival",
  p.is_best_seller AS "isBestSeller",
  p.created_at AS "createdAt", p.updated_at AS "updatedAt",
  b.name AS "brandName", c.name AS "categoryName",
  COALESCE(
    (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.url, 'alt', pi.alt)
                     ORDER BY pi."order")
     FROM product_images pi WHERE pi.product_id = p.id),
    '[]'::json
  ) AS images
`;

/**
 * Light projection for LIST endpoints (products/index, featured, new-arrivals).
 * Omits the per-row correlated json_agg of images (which ran once per row — up
 * to 100 extra subquery executions per request) and the heavy description/video
 * fields that list/grid cards never render. Keeps a scalar subquery for the
 * first image URL so cards without a thumbnail still show a real photo.
 */
export const PRODUCT_LIST_SELECT = `
  p.id, p.name, p.slug,
  p.short_description AS "shortDescription",
  p.price, p.discount_price AS "discountPrice",
  p.sku, p.brand_id AS "brandId", p.category_id AS "categoryId",
  p.stock, p.thumbnail_url AS "thumbnailUrl",
  p.rating, p.review_count AS "reviewCount",
  p.is_featured AS "isFeatured", p.is_new_arrival AS "isNewArrival",
  p.is_best_seller AS "isBestSeller",
  p.created_at AS "createdAt", p.updated_at AS "updatedAt",
  b.name AS "brandName", c.name AS "categoryName",
  (SELECT pi.url FROM product_images pi
    WHERE pi.product_id = p.id ORDER BY pi."order" LIMIT 1) AS "firstImageUrl"
`;

export const PRODUCT_FROM = `
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN categories c ON c.id = p.category_id
`;

export const IMAGE_SELECT = `
  id, url, alt, "order", is_primary AS "isPrimary", image_path AS "imagePath"
`;

export const SPEC_SELECT = `id, key, value`;
