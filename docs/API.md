# Gadget Wallet API Documentation

The production API is a set of **plain Node.js serverless functions** under
`api/` that run on Vercel. Each file maps to a route via Vercel file-system
routing (`[id].js` → `/:id`). The functions query Neon PostgreSQL directly with
raw SQL (`@neondatabase/serverless`) and upload product images to Supabase
Storage.

> **Local development** runs a different, fuller API: the Hono app under
> `apps/server` (via `bun run dev`) implements everything the functions do plus
> cart, wishlist, orders, reviews, coupons, addresses, payment methods,
> notifications and recently-viewed. Those extra endpoints are **not deployed**
> — see [Not deployed on Vercel](#not-deployed-on-vercel).

## Base URL

- Development (Hono): `http://localhost:3000/api`
- Production (Vercel): `https://your-domain.vercel.app/api`

The frontend always calls the **same-origin** `/api` prefix — no `VITE_API_URL`,
no CORS required.

## Conventions

### Response envelope

Every endpoint returns a JSON envelope. Success:

```json
{ "success": true, "data": { ... }, "message": "optional human-readable text" }
```

Error:

```json
{ "success": false, "error": "Human-readable error message" }
```

The paginated products list adds paging metadata:

```json
{ "success": true, "data": [ ... ], "total": 11, "page": 1, "limit": 20, "totalPages": 1 }
```

### Authentication

Two kinds of protected routes, both using a **Bearer JWT** in the
`Authorization` header:

| Guard | Required payload | Routes |
|---|---|---|
| `requireAuth` | any valid JWT, user must exist + be active + `token_version` must match | `/api/auth/me`, `/api/profile/*` |
| `requireAdmin` | JWT with `role: "admin"` | `/api/admin/*` |

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

An admin JWT comes from either:
1. `POST /api/admin/login` — env-based (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), or
2. `POST /api/auth/login` — a `users`-table account whose `role = 'admin'`
   (the admin panel's own login flow).

If `JWT_SECRET` is missing or a placeholder in production, the API fails
loudly instead of signing with a default secret.

### Content types

- JSON APIs: `Content-Type: application/json` — Vercel's Node runtime parses
  the body into `req.body`. Endpoints validate required fields themselves and
  return `400` when they're missing; a missing/empty body is treated as `{}`.
- Admin product create / image upload accept **`multipart/form-data`** (the
  admin panel sends `FormData`) **or** JSON — multipart is parsed with `busboy`
  into `fields` + buffered `files`.

### HTTP status codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created (admin product) |
| `400` | Validation error / malformed input |
| `401` | Missing/invalid/expired token, or bad credentials |
| `403` | Authenticated but not allowed (non-admin on admin route, disabled account) |
| `404` | Resource not found |
| `405` | Method not allowed for that route |
| `409` | Conflict (duplicate slug/SKU/email) |
| `500` | Server error (check Vercel Function Logs) |

---

## 1. Authentication — `/api/auth`

### `POST /api/auth/register`

Create an account. `name` ≥ 2 chars, `password` ≥ 6 chars, valid email.

```bash
curl -X POST https://<project>.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","name":"Ada Lovelace","password":"secret123"}'
```

```json
{
  "success": true,
  "data": {
    "user": { "id": "…", "email": "ada@example.com", "name": "Ada Lovelace", "role": "user", "tokenVersion": 0, "isActive": true, "twoFactorEnabled": false, "phone": null, "avatar": null, "createdAt": "2026-08-07T…Z" },
    "token": "eyJhbGciOiJIUzI1NiIs…"
  },
  "message": "Registration successful"
}
```

Errors: `400` invalid fields, `409` email already registered.

### `POST /api/auth/login`

```bash
curl -X POST https://<project>.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gadgetwallet.com","password":"admin123"}'
```

```json
{
  "success": true,
  "data": {
    "user": { "id": "…", "email": "admin@gadgetwallet.com", "name": "Admin", "role": "admin", "tokenVersion": 0, "isActive": true, "twoFactorEnabled": false, "phone": null, "avatar": null, "createdAt": "…" },
    "token": "eyJhbGciOiJIUzI1NiIs…"
  },
  "message": "Login successful"
}
```

Errors: `400` missing fields, `401` invalid credentials, `403` disabled account.

### `GET /api/auth/me`

Returns the authenticated user **re-checked against the database** (fresh
`isActive` / `tokenVersion`).

```bash
curl https://<project>.vercel.app/api/auth/me -H "Authorization: Bearer <token>"
```

```json
{ "success": true, "data": { "id": "…", "email": "…", "name": "…", "role": "admin", "tokenVersion": 0, "isActive": true, "twoFactorEnabled": false, "phone": null, "avatar": null, "createdAt": "…" } }
```

### `POST /api/auth/logout-all`

Invalidates every issued session by bumping `users.token_version`.

```bash
curl -X POST https://<project>.vercel.app/api/auth/logout-all -H "Authorization: Bearer <token>"
```

```json
{ "success": true, "data": null, "message": "Logged out from all devices" }
```

---

## 2. Profile — `/api/profile`

All routes require `Authorization: Bearer <token>`.

### `GET /api/profile`

```json
{ "success": true, "data": { "user": { "id": "…", "name": "…", "email": "…", "role": "user", "phone": null, "avatar": null, "tokenVersion": 0, "isActive": true, "twoFactorEnabled": false, "createdAt": "…" } } }
```

### `PUT /api/profile`

Update `name`, `phone`, `avatar` (all optional — omitted fields keep their
current values).

```bash
curl -X PUT https://<project>.vercel.app/api/profile \
  -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"name":"Ada Lovelace","phone":"+1 555 0100"}'
```

```json
{ "success": true, "data": { "id": "…", "name": "Ada Lovelace", "phone": "+1 555 0100", "avatar": null, "role": "user", "tokenVersion": 0, "isActive": true, "twoFactorEnabled": false, "createdAt": "…" }, "message": "Profile updated successfully" }
```

### `PUT /api/profile/password`

`newPassword` must be ≥ 8 chars.

```bash
curl -X PUT https://<project>.vercel.app/api/profile/password \
  -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"currentPassword":"secret123","newPassword":"newsecret456"}'
```

```json
{ "success": true, "data": null, "message": "Password changed successfully" }
```

Errors: `400` wrong current password or short new password.

### `PUT /api/profile/two-factor`

```bash
curl -X PUT https://<project>.vercel.app/api/profile/two-factor \
  -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"enabled":true}'
```

```json
{ "success": true, "data": { "id": "…", "twoFactorEnabled": true, "…": "…" } }
```

---

## 3. Products — `/api/products`

### `GET /api/products`

Paginated list of **live** products (soft-deleted excluded), newest first.

Query params:

| Param | Type | Notes |
|---|---|---|
| `page` | int ≥ 1 | default `1` |
| `limit` | int 1–100 | default `20` |
| `category` | slug **or** uuid | filters by category |
| `brand` | slug **or** uuid | filters by brand |
| `search` | string | case-insensitive substring match on `name` |

```bash
curl "https://<project>.vercel.app/api/products?page=1&limit=10&category=laptops&search=rog"
```

```json
{
  "success": true,
  "data": [
    {
      "id": "47d5c3e5-…", "name": "ASUS ROG Zephyrus G16", "slug": "asus-rog-zephyrus-g16",
      "shortDescription": "…", "fullDescription": "…",
      "price": "1299.99", "discountPrice": "1199.00",
      "sku": "ROG-G16-2026", "brandId": "…", "categoryId": "…", "stock": 25,
      "thumbnailUrl": "https://xxxx.supabase.co/storage/v1/object/public/products/…",
      "videoUrl": null, "rating": "4.80", "reviewCount": 12,
      "isFeatured": true, "isNewArrival": true, "isBestSeller": false,
      "createdAt": "…", "updatedAt": "…",
      "brandName": "ASUS", "categoryName": "Laptops"
    }
  ],
  "total": 11, "page": 1, "limit": 10, "totalPages": 2
}
```

### `GET /api/products/featured`

Homepage hero grid — up to 8 `is_featured` products.

```json
{ "success": true, "data": [ { "…": "same product shape as above" } ] }
```

### `GET /api/products/new-arrivals`

Up to 12 `is_new_arrival` products, newest first.

### `GET /api/products/:slug-or-id`

Detail by **slug** (how the storefront navigates) **or** raw uuid id. Includes
`images` and `specs`.

```bash
curl https://<project>.vercel.app/api/products/ipad-pro-m4-13-inch
```

```json
{
  "success": true,
  "data": {
    "id": "…", "name": "iPad Pro M4 13-inch", "slug": "ipad-pro-m4-13-inch", "…": "…",
    "images": [
      { "id": "…", "url": "https://xxxx.supabase.co/storage/v1/object/public/products/…", "alt": "iPad Pro M4 13-inch", "order": 0, "isPrimary": true, "imagePath": "products/<productId>/…" }
    ],
    "specs": [ { "id": "…", "key": "Chip", "value": "Apple M4" } ]
  }
}
```

Errors: `404` unknown slug/id, `500` on query failure.

---

## 4. Categories & Brands

### `GET /api/categories`

All categories with a live-product `count` (excludes soft-deleted products).

```json
{
  "success": true,
  "data": [
    { "id": "…", "name": "Laptops", "slug": "laptops", "description": "…", "image": "…", "parentId": null, "count": 4 }
  ]
}
```

### `GET /api/categories/:slug`

Single category, or `{ "success": true, "data": null }` when not found.

### `GET /api/brands`

```json
{ "success": true, "data": [ { "id": "…", "name": "ASUS", "slug": "asus", "logo": "…", "description": "…", "createdAt": "…" } ] }
```

### `GET /api/brands/:slug`

Single brand, or `{ "success": true, "data": null }` when not found.

---

## 5. Admin — `/api/admin`

All routes require `Authorization: Bearer <token>` with `role: "admin"`.

### `POST /api/admin/login`

Env-based admin login (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

```bash
curl -X POST https://<project>.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"strongpassword"}'
```

```json
{ "success": true, "data": { "token": "eyJhbGciOiJIUzI1NiIs…", "email": "admin@example.com" }, "message": "Admin login successful" }
```

Errors: `401` invalid credentials, `405` non-POST.

### `GET /api/admin/dashboard`

Stat cards for the dashboard.

```json
{
  "success": true,
  "data": { "totalProducts": 11, "totalOrders": 42, "totalUsers": 128, "revenue": 15480.5 }
}
```

### `GET /api/admin/orders`

Latest 20 orders for the admin table.

```json
{
  "success": true,
  "data": [
    { "id": "…", "status": "pending", "paymentStatus": "paid", "total": "1299.99", "createdAt": "…", "updatedAt": "…" }
  ]
}
```

### `GET /api/admin/products`

All live products (same product shape as the public list).

### `POST /api/admin/products`

Create a product. Accepts **`multipart/form-data`** (fields + image files, as
the admin panel sends) **or** JSON.

Required fields: `name`, `slug`, `shortDescription`, `fullDescription`,
`price`, `sku`, `brandId`, `categoryId`.
Optional: `stock`, `discountPrice`, `isFeatured`, `isNewArrival`,
`isBestSeller`, `thumbnailUrl` (or guide-style `image_url`).
Images: JPG/JPEG/PNG/WEBP, ≤ 5 MB each, max 12 per product. The first image
becomes the cover (`thumbnail_url`). JSON clients without files should supply
`thumbnailUrl`/`image_url`.

```bash
curl -X POST https://<project>.vercel.app/api/admin/products \
  -H "Authorization: Bearer <token>" \
  -F "name=Mechanical Keyboard" -F "slug=mechanical-keyboard-k87" \
  -F "shortDescription=Hot-swappable 87-key" -F "fullDescription=…" \
  -F "price=89.99" -F "sku=K87-BLK" \
  -F "brandId=<brand-uuid>" -F "categoryId=<category-uuid>" \
  -F "stock=50" -F "isFeatured=true" \
  -F "images=@k87.jpg;type=image/jpeg"
```

```json
{ "success": true, "data": { "id": "…", "name": "Mechanical Keyboard", "slug": "mechanical-keyboard-k87", "…": "…" }, "message": "Product created" }
```

Errors: `400` missing field / invalid image, `409` duplicate slug or SKU,
`500` create failed (uploaded images are cleaned up on failure).

### `GET /api/admin/products/:id`

Product detail incl. `images` + `specs` (same shape as public detail).

### `PATCH /api/admin/products/:id`

Partial update — only sent fields are changed (a stock-only edit never wipes
`discountPrice`). Send `"discountPrice": null` to clear a discount.

```bash
curl -X PATCH https://<project>.vercel.app/api/admin/products/<id> \
  -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"price":"79.99","stock":30,"isNewArrival":true}'
```

```json
{ "success": true, "data": { "id": "…", "price": "79.99", "stock": 30, "isNewArrival": true, "…": "…" }, "message": "Product updated" }
```

Errors: `400` empty update, `404` product not found, `409` duplicate slug/SKU.

### `DELETE /api/admin/products/:id`

Soft-deletes the product (sets `deleted_at`), deletes its Supabase images and
clears `thumbnail_url`.

```json
{ "success": true, "data": null, "message": "Product deleted and its images removed" }
```

### `POST /api/admin/products/:id/images`

Multipart upload of one or more images (same file rules as create). The first
upload becomes primary if the product has no images yet.

```json
{ "success": true, "data": [ { "id": "…", "url": "…", "alt": "…", "order": 0, "isPrimary": true, "imagePath": "products/<id>/…" } ], "message": "Uploaded 1 image" }
```

Errors: `400` no file / invalid image / over the 12-image limit, `404` product
not found.

### `PATCH /api/admin/products/:id/images/reorder`

Body: `{ "imageIds": ["<imageId>", …] }` — must contain **exactly** the
product's current images. Order is applied, the first becomes primary and
`thumbnail_url` is updated.

### `PATCH /api/admin/products/:id/images/:imageId`

Update an image: `{ "alt": "…" }` and/or `{ "isPrimary": true }` (setting
primary updates the product thumbnail).

### `DELETE /api/admin/products/:id/images/:imageId`

Deletes the image row **and** the file from Supabase Storage. If it was
primary, the next image (by order) becomes primary and the thumbnail is
updated.

---

## Not deployed on Vercel

These endpoints exist **only in the local Hono app** (`apps/server`, `bun run
dev`) and return **404 on Vercel**:

- `GET /api/health`
- Cart: `GET/POST/PATCH/DELETE /api/cart/*`
- Wishlist: `GET/POST/DELETE /api/wishlist/*`
- Customer orders: `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`
- Reviews: `GET/POST /api/reviews/*`
- Coupons: `GET/POST /api/coupons/*`
- Addresses: `GET/POST/PUT/DELETE /api/address/*`
- Payment methods: `GET/POST/DELETE /api/payment-methods/*`
- Notifications: `GET/PATCH /api/notifications/*`
- Recently viewed: `GET/POST /api/recently-viewed/*`

The storefront swallows load errors for these, so the site boots — but
add-to-cart, checkout, order history and the related profile sections will show
errors on the deployed site until those endpoints are ported to `api/`
functions.

---

## Validation & smoke test

A read-only smoke test exercises the deployed handlers against a real Neon
database:

```bash
bun run --env-file=.env scripts/smoke-api.mjs
```

It verifies auth guards (401/403), admin login, product/category/brand
endpoints, slug **and** id detail lookups, search, and method guards (405).
