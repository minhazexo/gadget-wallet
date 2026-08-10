# GadgetWallet Product Catalog Migration Plan (Bangladesh Market)

**Project:** GadgetWallet  
**Goal:** Keep only these categories and add Bangladesh-available products:

1. Earphone
2. Power Bank
3. USB Cable
4. Glass Protector
5. Earbuds
6. Smart Watch

**Database:** Neon PostgreSQL  
**Image Storage:** Supabase Storage  
**Existing codebase:** Already implemented; only data cleanup and proper product import are required.

---

## 1. First Step: Remove Old Products

Before importing the new catalog, delete all existing products, product images, and related records.

### Recommended order

```sql
-- Remove product images table if exists
DELETE FROM product_images;

-- Remove cart items if they reference products
DELETE FROM cart_items;

-- Remove wishlist items if they reference products
DELETE FROM wishlist_items;

-- Remove order items if you want a fully clean catalog
DELETE FROM order_items;

-- Finally remove products
DELETE FROM products;

-- Reset auto increment / identity
ALTER SEQUENCE products_id_seq RESTART WITH 1;
```

### If you use Prisma

```bash
bunx prisma studio
```

Delete all rows from `Product` and related image tables.

### If you use Drizzle

Run a migration or execute the SQL directly through Neon SQL editor.

---

# 2. New Category Structure

Use exactly these category names in the database.

| Category Name | Slug |
|---|---|
| Earphone | earphone |
| Power Bank | power-bank |
| USB Cable | usb-cable |
| Glass Protector | glass-protector |
| Earbuds | earbuds |
| Smart Watch | smart-watch |

---

# 3. Product Data Rules

Store in **Neon**:

- name
- slug
- category
- brand
- model
- short_description
- full_description
- price_bdt
- stock
- warranty
- color
- connector_type
- battery_capacity
- compatibility
- featured
- status
- created_at

Store in **Supabase**:

- product image files only.

Save the returned public URL in the product record field such as `image_url`.

---

# 4. Bangladesh Market Product List

The following products are widely available in Bangladesh through major retailers such as Gadget & Gear, Pickaboo, Daraz, Star Tech, Ryans, and official brand distributors.

> Prices are approximate retail ranges in BDT and should be updated before launch.

---

# 4.1 Earphone Category

| Brand | Model | Price Range |
|---|---|---|
| Xiaomi | Mi In-Ear Basic | 350-550 |
| Xiaomi | Redmi Earphones | 450-700 |
| Realme | Buds 2 Wired | 550-850 |
| Realme | Buds Classic | 400-650 |
| Baseus | Encok H06 | 500-900 |
| Baseus | Encok H18 | 650-950 |
| Hoco | M1 Original | 200-400 |
| Hoco | M88 | 300-500 |
| Joyroom | JR-E106 | 350-650 |
| Samsung | EO-IA500 | 850-1,300 |

**Suggested initial import:** 10 products.

---

# 4.2 Power Bank Category

| Brand | Model | Capacity | Price Range |
|---|---|---|---|
| Xiaomi | Redmi Power Bank | 10,000mAh | 1,300-1,900 |
| Xiaomi | Mi Power Bank 3 | 20,000mAh | 2,200-3,200 |
| Baseus | Bipow Digital Display | 10,000mAh | 1,400-2,200 |
| Baseus | Adaman Metal | 20,000mAh | 2,400-3,800 |
| Anker | PowerCore Select | 10,000mAh | 2,000-3,200 |
| Anker | PowerCore Essential | 20,000mAh | 3,200-4,800 |
| Joyroom | JR-QP191 | 10,000mAh | 1,300-2,000 |
| Hoco | J72 Easy Travel | 10,000mAh | 1,000-1,700 |
| Hoco | J86B | 20,000mAh | 1,700-2,600 |
| Oraimo | Traveler 3 | 20,000mAh | 1,900-3,000 |

**Suggested initial import:** 10 products.

---

# 4.3 USB Cable Category

| Brand | Model | Type | Price Range |
|---|---|---|---|
| Baseus | Superior Series | USB-C | 250-450 |
| Baseus | Cafule Series | USB-C | 350-650 |
| Anker | PowerLine Select+ | USB-C | 600-1,100 |
| Anker | PowerLine Micro USB | Micro USB | 500-950 |
| UGREEN | USB-C Fast Charging | USB-C | 350-700 |
| UGREEN | Lightning Cable | Lightning | 500-950 |
| Joyroom | S-CL020A9 | Lightning | 350-650 |
| Hoco | X14 Times Speed | USB-C | 200-450 |
| Hoco | X59 Magnificent | Lightning | 300-550 |
| Realme | Type-C VOOC Cable | USB-C | 350-650 |

**Suggested initial import:** 10 products.

---

# 4.4 Glass Protector Category

Create products by phone model because customers search by device.

| Brand | Device | Type | Price Range |
|---|---|---|---|
| Generic | iPhone 13 | Tempered Glass | 150-350 |
| Generic | iPhone 14 | Tempered Glass | 180-400 |
| Generic | iPhone 15 | Tempered Glass | 220-500 |
| Generic | Samsung S24 | Tempered Glass | 200-450 |
| Generic | Samsung A55 | Tempered Glass | 150-350 |
| Generic | Redmi Note 13 | Tempered Glass | 120-300 |
| Generic | Redmi Note 14 | Tempered Glass | 150-320 |
| Generic | Realme 12 | Tempered Glass | 120-300 |
| Generic | Vivo V40 | Tempered Glass | 150-320 |
| Generic | Oppo Reno 12 | Tempered Glass | 150-350 |

**Suggested initial import:** 10 products.

---

# 4.5 Earbuds Category

| Brand | Model | Price Range |
|---|---|---|
| Redmi | Buds 6 Play | 1,400-2,200 |
| Redmi | Buds 5 | 2,200-3,600 |
| Realme | Buds T110 | 1,500-2,400 |
| Realme | Buds Air 6 | 3,800-5,800 |
| Baseus | Bowie WM02 | 1,600-2,500 |
| Baseus | Bowie E13 | 1,400-2,200 |
| Anker Soundcore | R50i | 2,000-3,200 |
| Anker Soundcore | A20i | 2,200-3,500 |
| QCY | T13 ANC | 1,800-3,000 |
| Samsung | Galaxy Buds FE | 6,500-9,500 |

**Suggested initial import:** 10 products.

---

# 4.6 Smart Watch Category

| Brand | Model | Price Range |
|---|---|---|
| Xiaomi | Redmi Watch 5 Active | 3,500-5,500 |
| Xiaomi | Redmi Watch 5 Lite | 4,200-6,200 |
| Xiaomi | Mi Watch Lite | 4,000-6,500 |
| Realme | Watch S2 | 4,500-7,500 |
| Realme | Watch 3 | 3,200-5,200 |
| Haylou | Solar Lite | 2,200-3,800 |
| Haylou | RS4 Plus | 2,800-4,500 |
| Kieslect | Calling Watch KR | 3,000-5,000 |
| Amazfit | Bip 5 | 5,500-8,500 |
| Samsung | Galaxy Fit3 | 5,000-7,500 |

**Suggested initial import:** 10 products.

---

# 5. Minimum Launch Catalog

| Category | Product Count |
|---|---|
| Earphone | 10 |
| Power Bank | 10 |
| USB Cable | 10 |
| Glass Protector | 10 |
| Earbuds | 10 |
| Smart Watch | 10 |
| **Total** | **60 products** |

This is enough for a professional initial launch.

---

# 6. Product Description Template

Use a consistent template for AI-generated descriptions.

## Example

### Name
Baseus Bipow Digital Display 10000mAh Power Bank

### Short Description
10000mAh fast charging power bank with digital battery display.

### Full Description
- Capacity: 10000mAh
- Fast charging support
- Dual USB output
- LED battery percentage display
- Compact travel-friendly design
- Compatible with Android and iPhone devices

### Warranty
6 Months Brand Warranty

### Stock
25

### Featured
true

### Status
active

---

# 7. Supabase Image Upload Structure

Create a bucket named:

```text
product-images
```

Folder structure:

```text
product-images/
  earphone/
  power-bank/
  usb-cable/
  glass-protector/
  earbuds/
  smart-watch/
```

File naming:

```text
{category}/{brand}-{model}.webp
```

Example:

```text
power-bank/baseus-bipow-10000mah.webp
```

---

# 8. Recommended Image Specifications

| Type | Size |
|---|---|
| Product image | 1200x1200 px |
| Format | WEBP |
| Background | White |
| Quality | 80-85% |

---

# 9. AI Import Prompt

Use this prompt with Claude, GPT, or another coding AI.

```text
You are working on the GadgetWallet ecommerce project.

Task:
1. Delete all existing products from the Neon database.
2. Keep only these categories:
   Earphone, Power Bank, USB Cable, Glass Protector, Earbuds, Smart Watch.
3. Insert approximately 60 Bangladesh-available products using the provided catalog.
4. Generate slugs automatically.
5. Upload product images to Supabase bucket "product-images".
6. Save the public image URL in the database.
7. Mark 2 products per category as featured.
8. Ensure all products have stock, warranty, descriptions, price, and brand fields.
9. Do not modify existing application logic; update data only.
10. Return a summary of inserted products grouped by category.
```

---

# 10. SEO Recommendations

Generate for each product:

- meta_title
- meta_description
- keywords

Example:

```text
Meta Title: Baseus Bipow 10000mAh Power Bank Price in Bangladesh
Meta Description: Buy Baseus Bipow 10000mAh fast charging power bank at GadgetWallet with official warranty and fast delivery in Bangladesh.
Keywords: Baseus power bank, 10000mAh power bank Bangladesh, fast charging power bank
```

---

# 11. Homepage Featured Products

Show these six products on the homepage hero section.

| Category | Product |
|---|---|
| Earphone | Realme Buds 2 |
| Power Bank | Baseus Bipow 10000mAh |
| USB Cable | Anker PowerLine Select+ |
| Glass Protector | iPhone 15 Tempered Glass |
| Earbuds | Redmi Buds 5 |
| Smart Watch | Redmi Watch 5 Active |

---

# 12. Stock Management

Suggested initial stock:

- Earphone: 30
- Power Bank: 20
- USB Cable: 40
- Glass Protector: 50
- Earbuds: 20
- Smart Watch: 15

---

# 13. Delivery Information

Add a common delivery note to all products.

```text
- Delivery inside Dhaka: 24-48 hours
- Delivery outside Dhaka: 2-5 days
- Cash on Delivery available
- Easy return within 7 days for manufacturing defects
```

---

# 14. Final Validation Checklist

Before deployment verify:

- [ ] Old products deleted
- [ ] Exactly 6 categories exist
- [ ] ~60 products inserted
- [ ] All images uploaded to Supabase
- [ ] Image URLs saved in Neon
- [ ] Product pages display correctly
- [ ] Category filters work
- [ ] Search works
- [ ] Featured products appear on homepage
- [ ] Admin panel can edit products
- [ ] Prices display in BDT
- [ ] Mobile view checked
- [ ] Vercel production build successful

---

# 15. Suggested Next Expansion

After launch add:

- Fast charger adapters
- Wireless chargers
- MagSafe accessories
- Smart watch straps
- Earbuds protective cases
- Screen cleaning kits

These are closely related accessories and fit your current niche without expanding into unrelated electronics.

---

**Prepared for:** GadgetWallet Bangladesh product migration and catalog optimization.
