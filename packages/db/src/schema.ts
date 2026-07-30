import {
  pgTable,
  uuid,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    phone: text("phone"),
    avatar: text("avatar"),
    role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [uniqueIndex("email_idx").on(table.email)],
);

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  label: text("label").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  country: text("country").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: uuid("parent_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    shortDescription: text("short_description").notNull(),
    fullDescription: text("full_description").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    discountPrice: decimal("discount_price", { precision: 10, scale: 2 }),
    sku: text("sku").notNull().unique(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    stock: integer("stock").default(0).notNull(),
    videoUrl: text("video_url"),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isNewArrival: boolean("is_new_arrival").default(false).notNull(),
    isBestSeller: boolean("is_best_seller").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("slug_idx").on(table.slug),
    uniqueIndex("sku_idx").on(table.sku),
    index("featured_idx").on(table.isFeatured),
    index("category_idx").on(table.categoryId),
    index("brand_idx").on(table.brandId),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    order: integer("order").default(0).notNull(),
  },
  (table) => [index("product_image_idx").on(table.productId)],
);

export const productSpecs = pgTable(
  "product_specs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    key: text("key").notNull(),
    value: text("value").notNull(),
  },
  (table) => [index("product_spec_idx").on(table.productId)],
);

export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").default(1).notNull(),
  },
  (table) => [index("cart_item_cart_idx").on(table.cartId)],
);

export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("wishlist_user_product_idx").on(table.userId, table.productId),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    status: text("status", {
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
    })
      .default("pending")
      .notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discount: decimal("discount", { precision: 10, scale: 2 }).default("0").notNull(),
    shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0").notNull(),
    paymentMethod: text("payment_method").notNull(),
    shippingAddressId: uuid("shipping_address_id")
      .notNull()
      .references(() => addresses.id),
    couponId: uuid("coupon_id").references(() => coupons.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("order_user_idx").on(table.userId),
    index("order_status_idx").on(table.status),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [index("order_item_order_idx").on(table.orderId)],
);

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull(),
  type: text("type", { enum: ["percentage", "fixed"] }).notNull(),
  minOrder: decimal("min_order", { precision: 10, scale: 2 }),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    comment: text("comment").notNull(),
    isApproved: boolean("is_approved").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("review_product_idx").on(table.productId),
    index("review_user_idx").on(table.userId),
  ],
);

export const heroMedia = pgTable("hero_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  videoUrl: text("video_url").notNull(),
  posterUrl: text("poster_url"),
  headline: text("headline").notNull(),
  subheadline: text("subheadline").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const banners = pgTable("banners", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url").notNull(),
  position: text("position").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
  wishlists: many(wishlists),
  cart: many(carts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  specs: many(productSpecs),
  reviews: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
}));
