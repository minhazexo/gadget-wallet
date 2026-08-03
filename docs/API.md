# Gadget Wallet API Documentation

The backend service is powered by Hono framework running on Bun locally and Vercel Serverless Functions in production.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.vercel.app/api`

## Core Modules & Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login & JWT issuance
- `GET /api/auth/me` - Get authenticated user profile
- `POST /api/auth/logout-all` - Invalidate all tokens

### 2. Products (`/api/products`)
- `GET /api/products` - List products with pagination & filters
- `GET /api/products/:slug` - Product details by slug
- `GET /api/products/search` - Full text search

### 3. Categories & Brands
- `GET /api/categories` - Tree structure of categories
- `GET /api/brands` - List all brands

### 4. Cart & Checkout (`/api/cart`)
- `GET /api/cart/:sessionId` - Guest cart
- `GET /api/cart/user/:userId` - User cart
- `POST /api/cart/add` - Add item to cart
- `PATCH /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove` - Remove item

### 5. Orders (`/api/orders`)
- `POST /api/orders` - Place new order
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Order status & tracking
- `GET /api/orders/:id/invoice` - Render HTML invoice

### 6. Admin Panel (`/api/admin`)
- `GET /api/admin/dashboard` - Analytics & sales metrics
- `POST /api/admin/products` - Create product (with multipart image upload)
- `PATCH /api/admin/products/:id` - Edit product details
- `PATCH /api/admin/orders/:id/status` - Update order lifecycle status
