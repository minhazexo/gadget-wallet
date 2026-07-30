# Gadget Wallet - Premium Electronics eCommerce

A full-stack premium electronics eCommerce website built with modern technologies.

## Tech Stack

- **Frontend**: React + TypeScript + Vite (Bun runtime)
- **Backend**: Bun + Hono
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS + Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand

## Project Structure

```
/gadget-wallet
├── apps/
│   ├── web/          # React frontend
│   └── server/       # Hono API server
├── packages/
│   ├── ui/           # Shared UI components
│   ├── db/           # Database schema & migrations
│   └── types/        # Shared TypeScript types
├── package.json      # Workspace root
└── .env.example
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.1+
- [Neon PostgreSQL](https://neon.tech) database

### Setup

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials

# Generate database migrations
bun run db:generate

# Push schema to database
bun run db:push

# Seed with demo data
bun run db:seed

# Start development
bun run dev
```

The frontend runs on http://localhost:5173 and the API on http://localhost:3000.

### Default Admin

- Email: admin@gadgetwallet.com
- Password: admin123

## Features

- Cinematic hero section with video background
- 20+ public pages (Home, Shop, Product Details, Cart, Checkout, etc.)
- Full admin dashboard
- Product management with images, specs, and variants
- Shopping cart (guest + persistent)
- Wishlist functionality
- Order management
- Coupon system
- Responsive design (mobile to 4K)
- Framer Motion animations
- Dark premium theme
- SEO optimized

## Deployment

### Frontend (Vercel)

```bash
cd apps/web
vercel deploy
```

### Backend (Railway/Fly.io)

```bash
cd apps/server
railway up
```
