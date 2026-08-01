import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { join } from "path";
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
import { profileRoutes } from "./routes/profile";
import { addressRoutes } from "./routes/addresses";
import { paymentMethodRoutes } from "./routes/paymentMethods";
import { notificationRoutes } from "./routes/notifications";
import { recentlyViewedRoutes } from "./routes/recentlyViewed";

const app = new Hono();

app.use("*", cors({ origin: process.env.APP_URL || "http://localhost:5173", credentials: true }));
app.use("*", logger());
app.use("*", secureHeaders());

app.get("/api/health", (c) => c.json({ success: true, message: "Gadget Wallet API is running" }));

// Serve uploaded files
app.get("/uploads/:filename", async (c) => {
  const filename = c.req.param("filename");
  if (!filename || filename.includes("..")) {
    return c.json({ success: false, error: "Invalid filename" }, 400);
  }
  const filepath = join(import.meta.dir, "..", "uploads", filename);
  const file = Bun.file(filepath);
  const exists = await file.exists();
  if (!exists) {
    return c.json({ success: false, error: "File not found" }, 404);
  }
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
  };
  return new Response(file, {
    headers: { "Content-Type": mimeMap[ext || ""] || "application/octet-stream" },
  });
});

app.route("/api/auth", authRoutes);
app.route("/api/profile", profileRoutes);
app.route("/api/products", productRoutes);
app.route("/api/categories", categoryRoutes);
app.route("/api/brands", brandRoutes);
app.route("/api/cart", cartRoutes);
app.route("/api/wishlist", wishlistRoutes);
app.route("/api/orders", orderRoutes);
app.route("/api/reviews", reviewRoutes);
app.route("/api/coupons", couponRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/address", addressRoutes);
app.route("/api/payment-methods", paymentMethodRoutes);
app.route("/api/notifications", notificationRoutes);
app.route("/api/recently-viewed", recentlyViewedRoutes);

const port = parseInt(process.env.PORT || "3000");

Bun.serve({ port, fetch: app.fetch });
console.log(`Server running on http://localhost:${port}`);
