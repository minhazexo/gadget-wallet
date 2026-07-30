Act as a senior full-stack software architect, UI/UX designer, and eCommerce product engineer.

Build a **premium cinematic electronics eCommerce website** named **“Gadget-Wallet”** using the following stack:

### Tech Stack
- Frontend: React + TypeScript + Vite (Bun runtime)
- Backend: Bun + Hono (or Express compatible with Bun)
- Database: Neon PostgreSQL
- ORM: Drizzle ORM
- Authentication: JWT + HTTP-only cookies
- File Upload: Cloudinary
- Styling: Tailwind CSS + Framer Motion
- Icons: Lucide React
- State Management: Zustand
- Form Validation: Zod + React Hook Form

The project must be fully compatible with **Bun** (`bun install`, `bun run dev`, `bun run build`).

---

# Project Goal

Create a **high-end online electronics store** that sells gadgets such as smartphones, laptops, smartwatches, headphones, gaming accessories, cameras, and other electronic devices.

The website must look **luxury, modern, cinematic, and trustworthy**, similar to Apple, Samsung, Sony, or premium electronics brands.

---

# Design Requirements

## Global Style
- Dark premium theme with optional light mode.
- Colors:
  - Background: #0B0F19
  - Surface: #111827
  - Accent: #00D4FF
  - Secondary Accent: #7C3AED
  - Text Primary: #F9FAFB
  - Text Secondary: #9CA3AF
- Use glassmorphism cards, soft shadows, subtle gradients, and smooth hover effects.
- Use modern typography (Inter or Satoshi).

---

# Hero Section (Most Important)

Create a **full-screen cinematic hero section**.

Requirements:
- Background video autoplay, muted, looped, and optimized for performance.
- Overlay dark gradient for readability.
- Large headline:
  “Experience the Future of Technology”
- Subheadline:
  “Premium gadgets delivered to your doorstep.”
- CTA buttons:
  - Shop Now
  - Explore Collection
- Add animated floating device mockups (phone, laptop, smartwatch).
- Add scroll indicator animation.

The layout must feel cinematic and immersive.

---

# Public Website Pages

Create these pages with responsive design:

1. Home
2. Shop / Products
3. Product Details
4. Categories
5. Search Results
6. Cart
7. Checkout
8. Order Success
9. Wishlist
10. User Profile
11. My Orders
12. Login
13. Register
14. Forgot Password
15. About Us
16. Contact
17. FAQ
18. Privacy Policy
19. Terms & Conditions
20. 404 Page

---

# Home Page Sections

- Cinematic Hero Video
- Featured Products
- New Arrivals
- Best Sellers
- Gaming Collection Banner
- Laptop Collection Banner
- Brand Showcase (Apple, Samsung, Sony, ASUS, Logitech, etc.)
- Customer Testimonials
- Newsletter Subscription
- Trust Badges (Warranty, Secure Payment, Fast Delivery)
- Footer with social links

---

# Product Features

Each product must support:
- Name
- Slug
- Short description
- Full description
- Price
- Discount price
- SKU
- Brand
- Category
- Stock quantity
- Images (multiple)
- Video URL
- Specifications table
- Rating
- Review count
- Featured flag
- New arrival flag
- Best seller flag

Product details page should include:
- Image gallery with zoom
- Variant selector
- Add to Cart
- Buy Now
- Wishlist
- Share buttons
- Related products
- Customer reviews
- Specifications accordion

---

# eCommerce Features

Implement:
- Guest cart
- Persistent cart
- Wishlist
- Coupon system
- Promo banners
- Shipping calculation
- Cash on Delivery
- SSL-ready payment integration architecture
- Order tracking
- Email notification architecture
- Inventory management
- Low stock alerts

---

# Admin Panel

Create a secure `/admin` dashboard.

Admin features:
- Dashboard analytics
- Sales chart
- Revenue summary
- Recent orders
- Product management (CRUD)
- Category management
- Brand management
- Coupon management
- Order management
- User management
- Review moderation
- Hero video management
- Banner management
- Site settings
- SEO settings

Admin UI must be modern and responsive.

---

# Database Schema (Neon PostgreSQL)

Design normalized tables:
- users
- addresses
- categories
- brands
- products
- product_images
- product_specs
- carts
- cart_items
- wishlists
- orders
- order_items
- coupons
- reviews
- hero_media
- banners
- settings
- admins

Use proper foreign keys, indexes, timestamps, and soft-delete support where appropriate.

Provide Drizzle ORM schema files and migration setup.

---

# API Requirements

Create REST APIs with validation.

Endpoints should include:
- Auth
- Products
- Categories
- Brands
- Cart
- Wishlist
- Orders
- Reviews
- Coupons
- Admin analytics
- Admin product CRUD
- Admin order CRUD

Return consistent JSON responses.

---

# Performance Requirements

- Lazy load images
- Use responsive images
- Code splitting
- Route-based lazy loading
- Skeleton loaders
- Optimized video loading
- Lighthouse score target above 90

---

# SEO Requirements

Implement:
- Dynamic meta tags
- Open Graph tags
- Twitter cards
- Structured data (JSON-LD)
- Sitemap.xml
- Robots.txt
- Canonical URLs

---

# Security Requirements

- Password hashing with bcrypt
- JWT authentication
- HTTP-only cookies
- CSRF protection strategy
- Rate limiting
- Input sanitization
- Zod validation
- Secure headers
- Admin route protection

---

# Responsive Requirements

Perfect support for:
- Mobile (320px+)
- Tablet
- Laptop
- Desktop
- Large 4K screens

Navigation must become a mobile drawer menu.

---

# Animations

Use Framer Motion for:
- Page transitions
- Hero text reveal
- Product card hover
- Scroll-triggered animations
- Button micro-interactions
- Cart drawer animation

Keep animations smooth and premium, not excessive.

---

# Folder Structure

Generate a clean professional structure:

/apps/web
/apps/server
/packages/ui
/packages/db
/packages/types

Use shared types between frontend and backend.

---

# Environment Variables

Create `.env.example` for:
- DATABASE_URL (Neon)
- JWT_SECRET
- CLOUDINARY credentials
- APP_URL
- SMTP credentials

---

# Developer Experience

Provide:
- Bun scripts
- Type-safe API client
- Error handling utilities
- Loading states
- Empty states
- Toast notifications
- Reusable UI components

---

# Deliverables

Generate:
1. Complete folder structure
2. Bun setup commands
3. Neon connection setup
4. Drizzle configuration
5. Backend server code
6. Frontend pages
7. Admin dashboard
8. Database migrations
9. Seed script with demo products
10. Deployment guide for Vercel (frontend) and Railway/Fly.io (backend)
11. README.md with full setup instructions

---

# Important Quality Rules

- Use **unique component names and CSS class names** to avoid conflicts.
- Write clean, maintainable, production-level TypeScript code.
- No placeholder lorem ipsum in final UI; use realistic electronics content.
- Ensure all pages are connected with React Router.
- Ensure admin panel and public site share the same database dynamically.
- Do not use mock data except in the seed script.
- The final result should look like a real premium electronics brand ready for launch.

Start by generating the complete project architecture and folder structure, then proceed step by step with code implementation.