import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { readFile } from "fs/promises";
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
import { UPLOADS_DIR } from "./utils/storage";

/**
 * The full Gadget Wallet Hono application.
 *
 * This module is intentionally runtime-agnostic (no `Bun.*`, no `serve()`):
 * - Local development  → `index.ts` boots it with `Bun.serve`
 * - Vercel             → `../../api/[[route]].ts` serves it via `app.fetch`
 * - Standalone Node    → any HTTP server that calls `app.fetch`
 */
export const app = new Hono();

app.use("*", cors({ origin: process.env.APP_URL || "http://localhost:5173", credentials: true }));
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
