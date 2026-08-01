import { Hono } from "hono";
import { db, schema } from "@gadget-wallet/db";
import { eq, like, and, desc, sql, isNull } from "drizzle-orm";
import { success, error, paginated } from "../utils/response";

export const productRoutes = new Hono();

productRoutes.get("/", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const category = c.req.query("category");
  const brand = c.req.query("brand");
  const search = c.req.query("search");
  const sort = c.req.query("sort") || "created_at";
  const order = c.req.query("order") || "desc";

  // Resolve category slug -> id so /category/:slug works
  let categoryId = category;
  if (category && !/^[0-9a-fA-F-]{36}$/.test(category)) {
    const [cat] = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.slug, category))
      .limit(1);
    if (cat) categoryId = cat.id;
  }

  // Resolve brand slug -> id so /shop?brand=:slug works
  let brandId = brand;
  if (brand && !/^[0-9a-fA-F-]{36}$/.test(brand)) {
    const [brd] = await db
      .select({ id: schema.brands.id })
      .from(schema.brands)
      .where(eq(schema.brands.slug, brand))
      .limit(1);
    if (brd) brandId = brd.id;
  }

  const conditions = [isNull(schema.products.deletedAt)];
  if (categoryId) conditions.push(eq(schema.products.categoryId, categoryId));
  if (brandId) conditions.push(eq(schema.products.brandId, brandId));
  if (search) conditions.push(like(schema.products.name, `%${search}%`));

  const orderBy = desc(schema.products.createdAt);
  const offset = (page - 1) * limit;

  const [data, [{ count }]] = await Promise.all([
    db
      .select()
      .from(schema.products)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql`count(*)` })
      .from(schema.products)
      .where(and(...conditions)),
  ]);

  return paginated(c, data, Number(count), page, limit);
});

productRoutes.get("/featured", async (c) => {
  const products = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.isFeatured, true), isNull(schema.products.deletedAt)))
    .limit(8);
  return success(c, products);
});

productRoutes.get("/new-arrivals", async (c) => {
  const products = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.isNewArrival, true), isNull(schema.products.deletedAt)))
    .limit(8);
  return success(c, products);
});

productRoutes.get("/best-sellers", async (c) => {
  const products = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.isBestSeller, true), isNull(schema.products.deletedAt)))
    .limit(8);
  return success(c, products);
});

productRoutes.get("/by-id/:id", async (c) => {
  const id = c.req.param("id");
  const [product] = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.id, id), isNull(schema.products.deletedAt)))
    .limit(1);
  if (!product) return error(c, 404, "Product not found");
  const [images, specs] = await Promise.all([
    db.select().from(schema.productImages).where(eq(schema.productImages.productId, product.id)).orderBy(schema.productImages.order),
    db.select().from(schema.productSpecs).where(eq(schema.productSpecs.productId, product.id)),
  ]);
  return success(c, { ...product, images, specs });
});

productRoutes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [product] = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.slug, slug), isNull(schema.products.deletedAt)))
    .limit(1);
  if (!product) return error(c, 404, "Product not found");
  const [images, specs] = await Promise.all([
    db.select().from(schema.productImages).where(eq(schema.productImages.productId, product.id)).orderBy(schema.productImages.order),
    db.select().from(schema.productSpecs).where(eq(schema.productSpecs.productId, product.id)),
  ]);
  return success(c, { ...product, images, specs });
});
