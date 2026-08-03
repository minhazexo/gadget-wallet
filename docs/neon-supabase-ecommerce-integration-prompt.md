# Neon + Supabase Integration Prompt for Electronics eCommerce Website

I already have an almost-completed eCommerce website for selling electronics devices.

## Existing Tech Stack

- Frontend: React + Vite + Bun
- Backend: Bun + Express API
- Database: Neon PostgreSQL
- Image Storage: Supabase Storage

## Goal

I want a production-ready implementation where:

- All product information is stored in Neon PostgreSQL.
- All product images are stored in Supabase Storage.
- Each image is permanently and correctly linked to its specific product so images can never become mixed up.
- Product deletion removes all related images.
- Image ordering and primary thumbnail are managed properly.
- The system is secure, scalable, and easy to maintain.

Generate all necessary backend and frontend code.

---

## Environment Variables

Use these variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
DATABASE_URL=your_neon_database_connection_string
```

---

## Database Design (Neon PostgreSQL)

### Products Table

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  brand TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Product Images Table

```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Important Rules

- Use a separate `product_images` table.
- Enforce foreign key constraints.
- Delete image records automatically when a product is deleted.
- Store Supabase file path separately from public URL.

---

## Supabase Storage Structure

Create a bucket named:

```text
products
```

Store files using this pattern:

```text
products/{productId}/{timestamp}-{sanitizedFileName}
```

Example:

```text
products/7c1d2a4e-11aa-4f2d-b222-123456789abc/1722600000000-iphone15pro.jpg
```

This guarantees images are grouped by product ID and never become mixed.

---

## Backend Folder Structure

```text
server/
├── lib/
│   ├── db.js
│   └── supabase.js
├── middleware/
│   └── upload.js
├── routes/
│   └── products.js
├── controllers/
│   └── productsController.js
├── utils/
│   └── sanitizeFileName.js
├── app.js
└── server.js
```

---

## Supabase Client (lib/supabase.js)

Create an admin client using `SUPABASE_SERVICE_ROLE_KEY`.

Requirements:

- Use `@supabase/supabase-js`.
- Keep this file backend-only.
- Never expose the secret key to the frontend.

---

## Database Client (lib/db.js)

Create a PostgreSQL connection using `DATABASE_URL`.

Requirements:

- Use `pg` package.
- Export a reusable connection pool.
- Support transactions.

---

## File Upload Middleware

Use `multer` with memory storage.

Validation rules:

- Maximum file size: 5 MB.
- Allowed types: jpg, jpeg, png, webp.
- Reject all other file types.
- Return structured JSON errors.

---

## API Endpoints

### Create Product

`POST /api/products`

Content type: `multipart/form-data`

Fields:

- name
- slug
- description
- price
- brand
- category
- stock
- images[] (multiple files)

### Required Flow

1. Start database transaction.
2. Insert product into Neon and get `product.id`.
3. Upload each image to Supabase using product folder.
4. Save image metadata in `product_images`.
5. Mark first image as primary.
6. Update `products.thumbnail_url`.
7. Commit transaction.
8. If any upload fails:
   - rollback database transaction,
   - delete uploaded files from Supabase,
   - return error response.

Return full product with image list.

---

### Get Product

`GET /api/products/:id`

Return:

```json
{
  "id": "uuid",
  "name": "iPhone 15 Pro",
  "price": 999,
  "thumbnail_url": "https://...",
  "images": [
    {
      "id": "uuid",
      "image_url": "https://...",
      "is_primary": true,
      "sort_order": 0
    }
  ]
}
```

---

### Update Product

`PUT /api/products/:id`

Requirements:

- Update text fields.
- Allow adding new images.
- Do not remove existing images unless explicitly requested.
- Preserve image order unless new order is submitted.

---

### Delete Product Image

`DELETE /api/products/:productId/images/:imageId`

Steps:

1. Verify image belongs to product.
2. Delete file from Supabase using `image_path`.
3. Delete database row.
4. If deleted image was primary:
   - choose next image,
   - mark it primary,
   - update `products.thumbnail_url`.

---

### Delete Product

`DELETE /api/products/:id`

Steps:

1. Fetch all image paths.
2. Delete all files from Supabase.
3. Delete product from Neon.
4. Confirm successful cleanup.

---

## Transaction Safety

Ensure:

- Database and storage operations remain synchronized.
- No orphan image files exist.
- No orphan database records exist.
- Partial failures are fully rolled back.

---

## Frontend Admin Product Form

Create a professional product form with:

- Multiple image upload.
- Image preview before upload.
- Drag-and-drop reordering.
- Primary image selection.
- Remove selected image before upload.
- Upload progress indicator.
- Form validation.

Submit data using `FormData`.

---

## Product Card Display

Always display:

```js
product.thumbnail_url
```

Use fallback placeholder if missing.

---

## Product Details Page

- Fetch all images.
- Sort by `sort_order ASC`.
- Show image gallery with thumbnails.
- Change main image on thumbnail click.

---

## Validation Rules

Backend must validate:

- required name
- unique slug
- positive price
- non-negative stock
- allowed image MIME types
- maximum image size
- maximum number of images if desired

---

## Security Requirements

- Sanitize file names.
- Use UUIDs for IDs.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`.
- Upload files only through backend API.
- Restrict bucket access as needed.
- Use signed URLs if private storage is preferred.

---

## Error Response Format

Use consistent JSON:

```json
{
  "success": false,
  "message": "Image upload failed"
}
```

Handle:

- invalid file type
- oversized file
- duplicate slug
- missing product
- upload failure
- database failure
- network failure

---

## Performance Recommendations

- Compress images before upload.
- Generate WebP versions if possible.
- Add indexes:

```sql
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_products_slug ON products(slug);
```

- Paginate product listing API.
- Use CDN URLs from Supabase.

---

## Example Upload Flow

1. Admin selects product images.
2. Frontend sends `multipart/form-data`.
3. Backend creates product in Neon.
4. Backend uploads files to Supabase folder.
5. Backend stores image metadata.
6. Backend returns product with image URLs.
7. Frontend displays uploaded images immediately.

---

## Example API Request

```http
POST /api/products
Content-Type: multipart/form-data
```

Fields:

```text
name=iPhone 15 Pro
slug=iphone-15-pro
price=1299
brand=Apple
category=Smartphone
stock=15
images[]=file1
images[]=file2
```

---

## Example Success Response

```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "name": "iPhone 15 Pro",
    "thumbnail_url": "https://...",
    "images": [
      {
        "image_url": "https://...",
        "is_primary": true
      }
    ]
  }
}
```

---

## Required Deliverables

Generate all of the following:

- SQL migration files
- Complete Bun/Express backend code
- Supabase helper file
- PostgreSQL connection file
- Multer middleware
- Product controller
- Product routes
- Utility functions
- React admin form component
- Product details page component
- Product gallery component
- Example API requests and responses
- `.env.example`
- Step-by-step Neon setup guide
- Step-by-step Supabase Storage setup guide
- Production deployment checklist

---

## Final Requirement

Ensure the final implementation is:

- production-ready,
- modular,
- scalable,
- secure,
- and fully compatible with my existing React + Bun electronics eCommerce website.