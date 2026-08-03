# 🛠️ Neon + Supabase Production Guide (Product Images)

This guide explains how product data and images are wired together for production:

- **All product information** → Neon PostgreSQL (Drizzle ORM)
- **All product images** → Supabase Storage (public `products` bucket)
- **Linkage** → each `product_images` row stores a `product_id` foreign key **and** the
  Supabase storage path (`products/{productId}/{file}`), so images are grouped by product
  and can never be mixed up.

> Backend is Hono + Bun (not Express) and uses `c.req.parseBody()` for multipart uploads —
> the same feature set as multer, without the dependency.

---

## 1. Database (Neon PostgreSQL)

1. Create a project at [neon.tech](https://neon.tech) → copy the connection string:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
2. Add it to `.env` (copy from `.env.example`).
3. Run migrations:
   ```bash
   bun install
   bun run db:generate   # if you change packages/db/src/schema.ts
   bun run db:push       # applies schema to Neon (or bun run db:migrate for journal-based)
   bun run db:seed       # creates admin user, categories, brands, products
   ```

### Relevant schema

```ts
// packages/db/src/schema.ts
export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),          // public URL the browser loads
  imagePath: text("image_path"),       // products/{productId}/{file} — used for deletion
  alt: text("alt").notNull(),
  order: integer("order").default(0).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
});

// products gains: thumbnailUrl: text("thumbnail_url")  // primary cover URL
```

The foreign key is `ON DELETE CASCADE`, and `image_path` is stored separately from the
public `url` so deletion never depends on string-parsing a URL.

---

## 2. Image Storage (Supabase Storage)

1. Create a project at [supabase.com](https://supabase.com).
2. **Storage → New bucket** → name: `products` → **Public bucket** (so image URLs are
   directly accessible without auth).
3. Copy credentials from **Project Settings → API**:
   - `SUPABASE_URL` (e.g. `https://xxxx.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — never ship it to the browser)

### Storage layout

```
products/{productId}/{timestamp}-{random}.{ext}
# e.g. products/7c1d2a4e-11aa-4f2d-b222-123456789abc/1722600000000-a1b2c3d4e5f6.jpg
```

Files are physically grouped under the owning product id. The storage helper
(`apps/server/src/utils/storage.ts`) sanitizes every file name, whitelists
extensions (`jpg`, `jpeg`, `png`, `webp`), enforces the 5 MB limit, and only ever
deletes objects inside the `products/<id>/` namespace.

> **Dev fallback:** if `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are not set and
> `NODE_ENV !== "production"`, files are written to `apps/server/uploads/products/<id>/`
> and served from `/uploads/*`. In production the server **requires** Supabase.

---

## 3. API Endpoints

All admin routes require `Authorization: Bearer <admin-jwt>` (JWT + admin role).

### Create product (multipart, with images)

```
POST /api/admin/products
Content-Type: multipart/form-data

name=iPhone 15 Pro
slug=iphone-15-pro
shortDescription=...
fullDescription=...
price=1299.99
discountPrice=1199.99
sku=APL-IP15-256
brandId=<uuid>
categoryId=<uuid>
stock=15
isFeatured=true
isNewArrival=true
isBestSeller=false
images[]=file1.jpg
images[]=file2.webp
```

Runs in a **DB transaction**: insert product → upload each image to
`products/{id}/…` → insert `product_images` rows (first is primary) → set
`thumbnail_url`. On any failure the transaction rolls back and already-uploaded
files are deleted — no orphans.

### Add images to an existing product

```
POST /api/admin/products/:id/images        (multipart, images[] = one or more files)
PATCH /api/admin/products/:id/images/:imageId   { "isPrimary": true } or { "alt": "..." }
PATCH /api/admin/products/:id/images/reorder    { "imageIds": ["id3","id1","id2"] }
DELETE /api/admin/products/:id/images/:imageId
```

Ownership is enforced: an image can only be read/updated/deleted/reordered when it
belongs to the product in the URL. Deleting the cover promotes the next image and
updates `thumbnail_url`.

### Get product (storefront)

```
GET /api/products/:slug     → { ..., thumbnailUrl, images: [{ id, url, alt, order, isPrimary }] }
GET /api/products/:id       (by-id) same shape
GET /api/products           list — includes thumbnailUrl on every product
```

### Delete product

```
DELETE /api/admin/products/:id
```

Removes every image file from Supabase, deletes the `product_images` rows
(cascade-safe), then soft-deletes the product.

---

## 4. Frontend

- **`/admin/products`** — list with thumbnails; Add / Edit / Delete wired up.
- **`/admin/products/new`** — create form: multi-image drag & drop, previews,
  drag + arrow reordering, cover selection, progress bar; submits one
  multipart `FormData` request.
- **`/admin/products/:id/edit`** — same form in edit mode; image operations
  (upload / reorder / cover / alt / delete) apply instantly to the product.
- **`/admin/products/:id`** — read-only detail with gallery + cover badge.
- Storefront cards use `thumbnailUrl`, falling back to the first image, then a
  placeholder. The product details gallery opens on the primary image.

---

## 5. Production Deployment Checklist

- [ ] `NODE_ENV=production` set on the host (enforces Supabase, disables disk fallback)
- [ ] `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set on the host, `products` bucket is **public**
- [ ] `DATABASE_URL` points to Neon (SSL), `JWT_SECRET` is a long random string
- [ ] `APP_URL` matches the deployed origin (CORS)
- [ ] Migrations applied: `bun run db:push` (or `db:migrate`)
- [ ] Run `bun run db:seed` on a fresh database (uploads placeholder images to Supabase when configured)
- [ ] Log in as admin (`admin@gadgetwallet.com` / `admin123`), create a product with images
- [ ] Verify: images render on the store, deleting a product removes its images from the bucket
- [ ] Frontend build: `bun run build` and typechecks pass

---

## 6. Example Responses

```jsonc
// GET /api/products/:slug
{
  "success": true,
  "data": {
    "id": "7c1d2a4e-...",
    "name": "iPhone 15 Pro",
    "thumbnailUrl": "https://xxxx.supabase.co/storage/v1/object/public/products/7c1d2a4e-.../1722600000000-a1b2c3d4e5f6.jpg",
    "images": [
      { "id": "…", "url": "https://….jpg", "alt": "iPhone 15 Pro", "order": 0, "isPrimary": true },
      { "id": "…", "url": "https://….webp", "alt": "iPhone 15 Pro view 2", "order": 1, "isPrimary": false }
    ]
  }
}
```
