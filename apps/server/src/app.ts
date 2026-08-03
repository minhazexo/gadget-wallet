import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { readFile } from "fs/promises";
import { join } from "path";
import { authRoutes } from "./routes/auth.js";
import { productRoutes } from "./routes/products.js";
import { categoryRoutes } from "./routes/categories.js";
import { brandRoutes } from "./routes/brands.js";
import { cartRoutes } from "./routes/cart.js";
import { wishlistRoutes } from "./routes/wishlist.js";
import { orderRoutes } from "./routes/orders.js";
import { reviewRoutes } from "./routes/reviews.js";
import { couponRoutes } from "./routes/coupons.js";
import { adminRoutes } from "./routes/admin.js";
import { profileRoutes } from "./routes/profile.js";
import { addressRoutes } from "./routes/addresses.js";
import { paymentMethodRoutes } from "./routes/paymentMethods.js";
import { notificationRoutes } from "./routes/notifications.js";
import { recentlyViewedRoutes } from "./routes/recentlyViewed.js";
import { UPLOADS_DIR } from "./utils/storage.js";

/**
 * The full Gadget Wallet Hono application.
 *
 * Runtime-agnostic:
 * - Local development  → `index.ts` boots it with `Bun.serve`
 * - Vercel             → `../../api/[[...route]].ts` serves it via `app.fetch`
 * - Standalone Node    → any HTTP server that calls `app.fetch`
 */
export const app = new Hono();

// CORS origins come from APP_URL (comma-separated for multiple domains, e.g.
// production + preview). Same-origin /api calls don't need CORS at all, so a
// missing APP_URL only affects cross-origin access — dev falls back to Vite.
const allowedOrigins = (process.env.APP_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use("*", cors({ origin: allowedOrigins, credentials: true }));
app.use("*", logger());
app.use("*", secureHeaders());

app.get("/api/health", (c) => c.json({ success: true, message: "Gadget Wallet API is running" }));

// Serve locally-uploaded files (dev fallback only — production uses Supabase
// Storage directly, and serverless filesystems are ephemeral anyway).
if (process.env.NODE_ENV !== "production") {
  app.get("/uploads/*", async (c) => {
    const relPath = c.req.path.replace(/^\/uploads\//, "");
    if (!relPath || relPath.includes("..") || relPath.includes(":")) {
      return c.json({ success: false, error: "Invalid filename" }, 400);
    }
    const filepath = join(UPLOADS_DIR, relPath);
    try {
      const buffer = await readFile(filepath);
      const ext = relPath.split(".").pop()?.toLowerCase();
      const mimeMap: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
        svg: "image/svg+xml",
      };
      return new Response(buffer, {
        headers: { "Content-Type": mimeMap[ext || ""] || "application/octet-stream" },
      });
    } catch {
      return c.json({ success: false, error: "File not found" }, 404);
    }
  });
}

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

// Consistent JSON errors for the API instead of Hono's plain-text fallback.
app.notFound((c) => c.json({ success: false, error: "Not Found" }, 404));
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ success: false, error: "Internal Server Error" }, 500);
});

export default app;
