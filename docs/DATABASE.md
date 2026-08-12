# Database Architecture & Schema

Gadget Wallet uses **Supabase PostgreSQL** managed via **Drizzle ORM** (the database
was migrated from Neon — see `docs/MIGRATE_NEON_TO_SUPABASE.md`). Image storage also
lives in Supabase, so the whole stack runs on Supabase only.

## Schema Models

- `users`: User profiles, role (`user` | `admin`), authentication credentials, token version.
- `addresses`: Multi-address book management per user with default flags.
- `categories`: Hierarchical product categories with slug indexing.
- `brands`: Manufacturer and vendor metadata.
- `products`: Catalog items, price, discount price, SKU, stock count, ratings.
- `product_images`: Supabase storage references and sorting order.
- `product_specs`: Key-value product technical specifications.
- `carts` & `cart_items`: Guest sessions and logged-in user cart synchronization.
- `wishlists`: Saved items for authenticated users.
- `orders` & `order_items`: Complete order history, line items, payment status, return workflow.
- `reviews`: Product ratings, titles, comments, and moderation flags.
- `payment_methods`: Stored cards and mobile banking providers.
- `notifications` & `notification_preferences`: User notification engine.

## Connection

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase **transaction pooler** URI (port 6543) — serverless-safe |
| `SUPABASE_DATABASE_URL` | Same URI; used by the Neon → Supabase migration scripts |

## Commands

```bash
# Generate migrations
bun db:generate

# Push schema changes to Supabase
bun db:push

# Seed initial data
bun db:seed

# Neon → Supabase migration (already completed)
bun scripts/migrate-neon-to-supabase/build-schema.js
bun scripts/migrate-neon-to-supabase/export.js
bun scripts/migrate-neon-to-supabase/import.js
```
