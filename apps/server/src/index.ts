import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { authRoutes } from "./routes/auth";
import { productRoutes } from "./routes/products";
import { categoryRoutes } from "./routes/categories";
import { brandRoutes } from "./routes/brands";
import { cartRoutes } from "./routes/cart";
import { wishlistRoutes } from "./routes/wishlist";
import { orderRoutes } from "./routes/orders";
import { reviewRoutes } from "./routes/reviews";
import { couponRoutes } from "./routes/coupons";
import { adminRoutes } from "./routes/admin";

const app = new Hono();

app.use("*", cors({ origin: process.env.APP_URL || "http://localhost:5173", credentials: true }));
app.use("*", logger());
app.use("*", secureHeaders());

app.get("/api/health", (c) => c.json({ success: true, message: "Gadget Wallet API is running" }));

app.route("/api/auth", authRoutes);
app.route("/api/products", productRoutes);
app.route("/api/categories", categoryRoutes);
app.route("/api/brands", brandRoutes);
app.route("/api/cart", cartRoutes);
app.route("/api/wishlist", wishlistRoutes);
app.route("/api/orders", orderRoutes);
app.route("/api/reviews", reviewRoutes);
app.route("/api/coupons", couponRoutes);
app.route("/api/admin", adminRoutes);

const port = parseInt(process.env.PORT || "3000");

Bun.serve({ port, fetch: app.fetch });
console.log(`Server running on http://localhost:${port}`);
