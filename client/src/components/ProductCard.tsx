import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { showToast } from "../store/useToastStore";
import { useRequireAuth } from "../lib/useRequireAuth";
import { useProductCard3D } from "./useProductCard3D";
import "../styles/product-card-3d.css";

/**
 * The product card — the core commerce component of the visual system.
 *
 * Home, Shop and Search share this single implementation (spec:
 * docs/goribergadget_complete_visual_guide.md §10). The card has TWO
 * sections:
 *
 *   1. Image zone (top) — the 3D effect lives here and nowhere else:
 *      the zone tilts toward the cursor + scales 1.05 (`useProductCard3D`
 *      spread on the zone div, the VanillaTilt equivalent), while the
 *      product image pops 0 → 100px toward the viewer and the circle
 *      pops 0 → 35px (styles/product-card-3d.css).
 *   2. Info section (bottom) — name, rating, price and key features are
 *      ALWAYS visible and deliberately static: no hover effect at all.
 *
 * All depth CSS lives in styles/product-card-3d.css (perspective wrapper
 * + preserve-3d chain — nothing may clip it). Touch devices and
 * prefers-reduced-motion get a static, always-readable layout.
 */

export interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  thumbnailUrl?: string;
  /** Light list projection — first gallery image (fallback when no thumbnail). */
  firstImageUrl?: string;
  images?: { url: string; alt: string }[];
  rating: number;
  shortDescription?: string;
}

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const requireAuth = useRequireAuth();
  const navigate = useNavigate();
  const tilt = useProductCard3D();

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // The whole card is a link, so the buttons must stop the click from
  // bubbling — otherwise adding to cart also navigates to the product page.
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return; // guests must sign in before adding to cart
    try {
      await useCartStore.getState().addItem(product.id);
      showToast(`${product.name} added to cart`);
    } catch {
      showToast("Failed to add to cart", "error");
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    try {
      await useCartStore.getState().addItem(product.id);
      navigate("/checkout");
    } catch {
      showToast("Failed to add to cart", "error");
    }
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="gw-product-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gw-red focus-visible:ring-offset-2"
    >
      {/* ── Image zone: the only section with the 3D hover effect ── */}
      <div className="gw-product-card-3d-wrap">
        <motion.div className="gw-product-card-3d-tilt" {...tilt}>
          <div className="gw-product-card-3d-stage">
            {discount > 0 && (
              <span className="gw-product-card-3d-badge absolute top-3 right-3 z-10 bg-gw-red text-white text-xs font-bold px-2.5 py-1.5 rounded-full">
                -{discount}%
              </span>
            )}

            <div className="gw-product-card-3d-circle" aria-hidden="true" />

            <img
              src={
                product.thumbnailUrl ||
                product.firstImageUrl ||
                product.images?.[0]?.url ||
                `https://picsum.photos/seed/${product.slug}/400/400`
              }
              alt={product.name}
              className="gw-product-card-3d-image"
              loading="lazy"
              decoding="async"
            />
          </div>
        </motion.div>
      </div>

      {/* ── Info section: static, always visible, no hover effect ── */}
      <div className="gw-product-card-3d-info">
        <h3 className="text-[15px] font-semibold text-gw-black leading-snug line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-gw-yellow text-gw-yellow" />
            <span className="text-xs text-gw-gray-500">{product.rating}</span>
          </span>
          <span className="flex items-baseline gap-1.5 flex-wrap justify-end">
            <span className="text-lg font-extrabold text-gw-red">
              ৳{product.discountPrice || product.price}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-gw-gray-400 line-through">
                ৳{product.price}
              </span>
            )}
          </span>
        </div>

        {product.shortDescription && (
          <p className="mt-1.5 text-xs text-gw-gray-500 leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
            className="gw-product-card-3d-cta bg-gw-black text-white hover:bg-gw-red"
          >
            Add to Cart
          </button>
          <button
            type="button"
            aria-label={`Buy ${product.name} now`}
            onClick={handleBuyNow}
            className="gw-product-card-3d-cta bg-gw-red text-white hover:bg-gw-red-hover"
          >
            Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
}
