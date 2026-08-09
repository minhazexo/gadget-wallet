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
  b.name AS "brandName", c.name AS "categoryName"
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
