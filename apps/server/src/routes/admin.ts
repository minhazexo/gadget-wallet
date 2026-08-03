import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db, schema } from "@gadget-wallet/db";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { success, error } from "../utils/response.js";
import {
  uploadImage,
  deleteImage,
  isAllowedImage,
  type UploadedImage,
} from "../utils/storage.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

export const adminRoutes = new Hono();

// ─── Security ─────────────────────────────────────────────────────
// Every /api/admin route requires a valid JWT for an active admin account.
adminRoutes.use("*", authMiddleware, adminMiddleware);

const MAX_IMAGES_PER_PRODUCT = 12;

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

// ─── Products ─────────────────────────────────────────────────────

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
      thumbnailUrl: schema.products.thumbnailUrl,
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

function coerceMultipartBooleans(body: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...body };
  for (const key of ["isFeatured", "isNewArrival", "isBestSeller"]) {
    if (typeof out[key] === "string") out[key] = out[key] === "true";
    else out[key] = Boolean(out[key]);
  }
  return out;
}

/**
 * Reads a product payload from either multipart/form-data (admin form with
 * images[]) or application/json (API clients). Returns validated product
 * values plus any image files to attach.
 */
async function readProductPayload(c: import("hono").Context) {
  const contentType = c.req.header("content-type") || "";
  const files: File[] = [];

  if (contentType.includes("multipart/form-data")) {
    const body = await c.req.parseBody({ all: true });
    const raw = body["images"];
    if (Array.isArray(raw)) {
      for (const f of raw) if (f instanceof File && f.size > 0) files.push(f);
    } else if (raw instanceof File && raw.size > 0) {
      files.push(raw);
    }

    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (key === "images" || value instanceof File) continue;
      fields[key] = typeof value === "string" ? value : String(value);
    }
    if (fields["discountPrice"] === "") fields["discountPrice"] = undefined;

    const values = productSchema.parse(coerceMultipartBooleans(fields));
    return { values, files };
  }

  const json = await c.req.json();
  // Apply the same boolean coercion so a JSON "false" string can't become true.
  const values = productSchema.parse(coerceMultipartBooleans(json));
  return { values, files };
}

/**
 * Uploads image files into the product's storage folder and records them in
 * the product_images table. The first image becomes the primary thumbnail.
 * Throws on any failure so the caller can roll back the DB transaction and
 * clean up any files already uploaded.
 */
async function attachImages(
  tx: any,
  productId: string,
  files: File[],
  altPrefix: string,
  uploadedPaths: string[],
) {
  const [countRow] = await tx
    .select({
      total: sql`count(*)`,
      maxOrder: sql`coalesce(max(${schema.productImages.order}), -1)`,
    })
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, productId));
  const existing = Number(countRow?.total ?? 0);
  const nextOrder = Number(countRow?.maxOrder ?? -1) + 1;

  if (existing + files.length > MAX_IMAGES_PER_PRODUCT) {
    throw new Error(`A product can have at most ${MAX_IMAGES_PER_PRODUCT} images`);
  }

  const uploaded: UploadedImage[] = [];
  for (const file of files) {
    if (!isAllowedImage(file)) {
      throw new Error(
        "Invalid image. Allowed types: JPG, JPEG, PNG, WEBP (max 5MB).",
      );
    }
    const result = await uploadImage(file, productId);
    uploadedPaths.push(result.path);
    uploaded.push(result);
  }

  const makePrimary = existing === 0 && uploaded.length > 0;
  for (let i = 0; i < uploaded.length; i++) {
    await tx.insert(schema.productImages).values({
      productId,
      url: uploaded[i].url,
      imagePath: uploaded[i].path,
      // Fall back to the original file name when no alt text was supplied.
      alt: altPrefix || files[i].name || "",
      order: nextOrder + i,
      isPrimary: makePrimary && i === 0,
    });
  }

  if (makePrimary) {
    await tx
      .update(schema.products)
      .set({ thumbnailUrl: uploaded[0].url, updatedAt: new Date() })
      .where(eq(schema.products.id, productId));
  }
}

/**
 * Create product — accepts multipart/form-data (fields + images[]) or JSON.
 * Runs in a DB transaction; if any image upload fails, the transaction is
 * rolled back and already-uploaded files are removed from storage.
 */
adminRoutes.post("/products", async (c) => {
  let values: z.infer<typeof productSchema>;
  let files: File[];
  try {
    ({ values, files } = await readProductPayload(c));
  } catch (err) {
    return error(c, 400, err instanceof Error ? err.message : "Invalid product data");
  }

  const uploadedPaths: string[] = [];
  try {
    const product = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(schema.products)
        .values({
          ...values,
          discountPrice: values.discountPrice || null,
          isFeatured: values.isFeatured || false,
          isNewArrival: values.isNewArrival || false,
          isBestSeller: values.isBestSeller || false,
        })
        .returning();

      if (files.length > 0) {
        await attachImages(tx, created.id, files, created.name, uploadedPaths);
      }
      return created;
    });

    return success(c, product, "Product created");
  } catch (err) {
    // Transaction rolled back — remove any orphaned files from storage.
    await Promise.allSettled(uploadedPaths.map((p) => deleteImage(p)));
    return error(c, 500, err instanceof Error ? err.message : "Failed to create product");
  }
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

  const [product] = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.id, id), isNull(schema.products.deletedAt)))
    .limit(1);
  if (!product) return error(c, 404, "Product not found");

  // Remove every image file from storage first, then the DB rows,
  // then soft-delete the product itself.
  const images = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, id));

  await Promise.allSettled(
    images.map((img) => deleteImage(img.imagePath || img.url)),
  );

  await db.delete(schema.productImages).where(eq(schema.productImages.productId, id));
  await db.delete(schema.productSpecs).where(eq(schema.productSpecs.productId, id));
  await db
    .update(schema.products)
    .set({ deletedAt: new Date(), thumbnailUrl: null, updatedAt: new Date() })
    .where(eq(schema.products.id, id));

  return success(c, null, "Product deleted and its images removed");
});

// ─── Product Images ──────────────────────────────────────────────

async function getProductOrNull(productId: string) {
  const [product] = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(and(eq(schema.products.id, productId), isNull(schema.products.deletedAt)))
    .limit(1);
  return product ?? null;
}

adminRoutes.get("/products/:id/images", async (c) => {
  const id = c.req.param("id");
  if (!(await getProductOrNull(id))) return error(c, 404, "Product not found");
  const images = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, id))
    .orderBy(schema.productImages.order);
  return success(c, images);
});

adminRoutes.post("/products/:id/images", async (c) => {
  const productId = c.req.param("id");

  const product = await getProductOrNull(productId);
  if (!product) return error(c, 404, "Product not found");

  const body = await c.req.parseBody({ all: true });
  const files: File[] = [];
  for (const key of ["images", "image"]) {
    const raw = body[key];
    if (Array.isArray(raw)) {
      for (const f of raw) if (f instanceof File && f.size > 0) files.push(f);
    } else if (raw instanceof File && raw.size > 0) {
      files.push(raw);
    }
  }
  if (files.length === 0) return error(c, 400, "No image file provided");

  const uploadedPaths: string[] = [];
  try {
    const result = await db.transaction(async (tx) => {
      await attachImages(tx, productId, files, (body["alt"] as string) || "", uploadedPaths);
      const images = await tx
        .select()
        .from(schema.productImages)
        .where(eq(schema.productImages.productId, productId))
        .orderBy(schema.productImages.order);
      return images;
    });
    return success(c, result, `Uploaded ${files.length} image${files.length > 1 ? "s" : ""}`);
  } catch (err) {
    await Promise.allSettled(uploadedPaths.map((p) => deleteImage(p)));
    return error(c, err instanceof Error && err.message.includes("at most") ? 400 : 500, err instanceof Error ? err.message : "Failed to upload image");
  }
});

/**
 * PATCH /products/:id/images/:imageId — update alt text and/or promote to
 * primary. Ownership is enforced: the image must belong to the product in
 * the URL or the request is rejected.
 */
adminRoutes.patch("/products/:id/images/:imageId", async (c) => {
  const { id: productId, imageId } = c.req.param();

  const [image] = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.id, imageId))
    .limit(1);
  if (!image || image.productId !== productId) {
    return error(c, 404, "Image not found for this product");
  }

  const body = await c.req.json().catch(() => ({}));
  const { alt, isPrimary } = body as { alt?: string; isPrimary?: boolean };

  const updates: Record<string, unknown> = {};
  if (typeof alt === "string" && alt.trim()) updates.alt = alt.trim();

  if (Object.keys(updates).length === 0 && isPrimary !== true) {
    return error(c, 400, "Nothing to update — provide alt or isPrimary");
  }

  if (isPrimary === true) {
    await db
      .update(schema.productImages)
      .set({ isPrimary: false })
      .where(eq(schema.productImages.productId, productId));
    updates.isPrimary = true;
    await db
      .update(schema.products)
      .set({ thumbnailUrl: image.url, updatedAt: new Date() })
      .where(eq(schema.products.id, productId));
  }

  const [updated] = await db
    .update(schema.productImages)
    .set(updates)
    .where(eq(schema.productImages.id, imageId))
    .returning();

  return success(c, updated, "Image updated");
});

/**
 * DELETE /products/:id/images/:imageId — removes the storage file and the DB
 * row, but only if the image belongs to the product in the URL. If the
 * deleted image was the primary one, the next image is promoted.
 */
adminRoutes.delete("/products/:id/images/:imageId", async (c) => {
  const { id: productId, imageId } = c.req.param();

  const [image] = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.id, imageId))
    .limit(1);
  if (!image || image.productId !== productId) {
    return error(c, 404, "Image not found for this product");
  }

  await deleteImage(image.imagePath || image.url);
  await db.delete(schema.productImages).where(eq(schema.productImages.id, imageId));

  // If we removed the primary image, promote the next one (by sort order).
  const remaining = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, productId))
    .orderBy(schema.productImages.order)
    .limit(1);

  if (image.isPrimary) {
    if (remaining.length > 0) {
      await db
        .update(schema.productImages)
        .set({ isPrimary: true })
        .where(eq(schema.productImages.id, remaining[0].id));
      await db
        .update(schema.products)
        .set({ thumbnailUrl: remaining[0].url, updatedAt: new Date() })
        .where(eq(schema.products.id, productId));
    } else {
      await db
        .update(schema.products)
        .set({ thumbnailUrl: null, updatedAt: new Date() })
        .where(eq(schema.products.id, productId));
    }
  }

  return success(c, null, "Image deleted");
});

/**
 * PATCH /products/:id/images/reorder — reorders the product's images.
 * Only image ids belonging to this product are accepted, and the first image
 * always becomes the primary thumbnail.
 */
adminRoutes.patch("/products/:id/images/reorder", async (c) => {
  const productId = c.req.param("id");
  const { imageIds } = await c.req.json().catch(() => ({}));

  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    return error(c, 400, "imageIds must be a non-empty array");
  }

  const existing = await db
    .select({ id: schema.productImages.id })
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, productId));

  const existingIds = new Set(existing.map((e) => e.id));
  if (
    imageIds.length !== existing.length ||
    imageIds.some((id: unknown) => typeof id !== "string" || !existingIds.has(id))
  ) {
    return error(c, 400, "imageIds must contain exactly this product's images");
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < imageIds.length; i++) {
      await tx
        .update(schema.productImages)
        .set({ order: i })
        .where(eq(schema.productImages.id, imageIds[i] as string));
    }
    // First image is the primary thumbnail.
    await tx
      .update(schema.productImages)
      .set({ isPrimary: false })
      .where(eq(schema.productImages.productId, productId));
    await tx
      .update(schema.productImages)
      .set({ isPrimary: true })
      .where(eq(schema.productImages.id, imageIds[0] as string));

    const [first] = await tx
      .select({ url: schema.productImages.url })
      .from(schema.productImages)
      .where(eq(schema.productImages.id, imageIds[0] as string))
      .limit(1);
    await tx
      .update(schema.products)
      .set({ thumbnailUrl: first?.url ?? null, updatedAt: new Date() })
      .where(eq(schema.products.id, productId));
  });

  return success(c, null, "Images reordered");
});

// ─── Users ────────────────────────────────────────────────────────

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
