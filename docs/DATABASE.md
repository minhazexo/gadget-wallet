# Database Architecture & Schema

Gadget Wallet utilizes **Neon Serverless PostgreSQL** managed via **Drizzle ORM**.

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

## Commands

```bash
# Generate migrations
bun db:generate

# Push schema changes to Neon
bun db:push

# Seed initial data
bun db:seed
```
