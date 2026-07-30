import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { success, error } from "../utils/response";
import { mkdirSync, existsSync } from "fs";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const UPLOADS_DIR = join(import.meta.dir, "..", "..", "uploads");

// Ensure uploads directory exists
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const adminRoutes = new Hono();

adminRoutes.get("/dashboard", async (c) => {
  const [totalProducts] = await db
    .select({ count: sql`count(*)` })
    .from(schema.products)
    .where(isNull(schema.products.deletedAt));
  const [totalOrders] = await db.select({ count: sql`count(*)` }).from(schema.orders);
  const [totalUsers] = await db.select({ count: sql`count(*)` }).from(schema.users);
  const [revenue] = await db
    .select({ total: sql`coalesce(sum(total), 0)` })
    .from(schema.orders)
    .where(eq(schema.orders.status, "delivered"));
  return success(c, {
    totalProducts: Number(totalProducts.count),
    totalOrders: Number(totalOrders.count),
    totalUsers: Number(totalUsers.count),
    revenue: Number(revenue.total),
  });
});

adminRoutes.get("/orders", async (c) => {
  const orders = await db
    .select()
    .from(schema.orders)
    .orderBy(desc(schema.orders.createdAt))
    .limit(20);
  return success(c, orders);
});

adminRoutes.get("/orders/:id", async (c) => {
  const id = c.req.param("id");
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!order) return error(c, 404, "Order not found");
  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id));
  return success(c, { ...order, items });
});

adminRoutes.patch("/orders/:id/status", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json();
  const [order] = await db
    .update(schema.orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.orders.id, id))
    .returning();
  return success(c, order, "Order status updated");
});

adminRoutes.get("/products", async (c) => {
  const products = await db
    .select()
    .from(schema.products)
    .where(isNull(schema.products.deletedAt))
    .orderBy(desc(schema.products.createdAt));
  return success(c, products);
});

adminRoutes.get("/products/:id", async (c) => {
  const id = c.req.param("id");

  const [product] = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      shortDescription: schema.products.shortDescription,
      fullDescription: schema.products.fullDescription,
      price: schema.products.price,
      discountPrice: schema.products.discountPrice,
      sku: schema.products.sku,
      brandId: schema.products.brandId,
      categoryId: schema.products.categoryId,
      stock: schema.products.stock,
      rating: schema.products.rating,
      reviewCount: schema.products.reviewCount,
      isFeatured: schema.products.isFeatured,
      isNewArrival: schema.products.isNewArrival,
      isBestSeller: schema.products.isBestSeller,
      createdAt: schema.products.createdAt,
      updatedAt: schema.products.updatedAt,
      brandName: sql`(select ${schema.brands.name} from ${schema.brands} where ${schema.brands.id} = ${schema.products.brandId})`,
      categoryName: sql`(select ${schema.categories.name} from ${schema.categories} where ${schema.categories.id} = ${schema.products.categoryId})`,
    })
    .from(schema.products)
    .where(and(eq(schema.products.id, id), isNull(schema.products.deletedAt)))
    .limit(1);

  if (!product) return error(c, 404, "Product not found");

  const [images, specs] = await Promise.all([
    db
      .select()
      .from(schema.productImages)
      .where(eq(schema.productImages.productId, id))
      .orderBy(schema.productImages.order),
    db
      .select()
      .from(schema.productSpecs)
      .where(eq(schema.productSpecs.productId, id)),
  ]);

  return success(c, { ...product, images, specs });
});

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: z.string().min(1),
  fullDescription: z.string().min(1),
  price: z.string().min(1),
  discountPrice: z.string().optional(),
  sku: z.string().min(1),
  brandId: z.string().uuid(),
  categoryId: z.string().uuid(),
  stock: z.coerce.number().int().min(0),
  isFeatured: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
});

adminRoutes.post("/products", zValidator("json", productSchema), async (c) => {
  const body = c.req.valid("json");
  const [product] = await db
    .insert(schema.products)
    .values({
      ...body,
      discountPrice: body.discountPrice || null,
      isFeatured: body.isFeatured || false,
      isNewArrival: body.isNewArrival || false,
      isBestSeller: body.isBestSeller || false,
    })
    .returning();
  return success(c, product, "Product created");
});

adminRoutes.patch("/products/:id", zValidator("json", productSchema.partial()), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const [product] = await db
    .update(schema.products)
    .set({
      ...body,
      discountPrice: body.discountPrice || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.products.id, id))
    .returning();
  if (!product) return error(c, 404, "Product not found");
  return success(c, product, "Product updated");
});

adminRoutes.delete("/products/:id", async (c) => {
  const id = c.req.param("id");
  await db.update(schema.products).set({ deletedAt: new Date() }).where(eq(schema.products.id, id));
  return success(c, null, "Product soft-deleted");
});

// ─── Product Images ──────────────────────────────────────────────

adminRoutes.get("/products/:id/images", async (c) => {
  const id = c.req.param("id");
  const images = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, id))
    .orderBy(schema.productImages.order);
  return success(c, images);
});

adminRoutes.post("/products/:id/images", async (c) => {
  const productId = c.req.param("id");
  const body = await c.req.parseBody();
  const file = body["image"] as File | undefined;

  if (!file) return error(c, 400, "No image file provided");

  if (!file.type.startsWith("image/")) {
    return error(c, 400, "File must be an image");
  }

  if (file.size > 5 * 1024 * 1024) {
    return error(c, 400, "Image must be under 5MB");
  }

  // Get the next order number
  const [lastImage] = await db
    .select({ maxOrder: sql`coalesce(max(${schema.productImages.order}), -1)` })
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, productId));
  const nextOrder = Number(lastImage?.maxOrder ?? -1) + 1;

  // Save file
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const filepath = join(UPLOADS_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const imageUrl = `/uploads/${filename}`;

  // Create DB record
  const [image] = await db
    .insert(schema.productImages)
    .values({
      productId,
      url: imageUrl,
      alt: body["alt"] as string || file.name,
      order: nextOrder,
    })
    .returning();

  return success(c, image, "Image uploaded");
});

adminRoutes.delete("/products/:id/images/:imageId", async (c) => {
  const { imageId } = c.req.param();

  const [image] = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.id, imageId))
    .limit(1);

  if (!image) return error(c, 404, "Image not found");

  // Delete file from disk
  const filename = image.url.split("/").pop();
  if (filename) {
    const filepath = join(UPLOADS_DIR, filename);
    try { await unlink(filepath); } catch { /* file may not exist */ }
  }

  // Delete DB record
  await db.delete(schema.productImages).where(eq(schema.productImages.id, imageId));

  return success(c, null, "Image deleted");
});

adminRoutes.patch("/products/:id/images/reorder", async (c) => {
  const productId = c.req.param("id");
  const { imageIds } = await c.req.json();

  if (!Array.isArray(imageIds)) return error(c, 400, "imageIds must be an array");

  await Promise.all(
    imageIds.map((imageId: string, index: number) =>
      db
        .update(schema.productImages)
        .set({ order: index })
        .where(
          eq(schema.productImages.id, imageId)
        )
    )
  );

  return success(c, null, "Images reordered");
});

adminRoutes.get("/users", async (c) => {
  const users = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .where(isNull(schema.users.deletedAt))
    .orderBy(desc(schema.users.createdAt));
  return success(c, users);
});
