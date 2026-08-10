import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { showToast } from "../store/useToastStore";
import { useRequireAuth } from "../lib/useRequireAuth";

/**
 * The product card — the core commerce component of the visual system.
 *
 * Home, Shop and Search each used to inline their own near-identical copy,
 * which had already drifted (differing padding, badge markup, and an
 * add-to-cart handler on Shop that navigated away instead of adding). This is
 * the single implementation; the spec lives in
 * docs/goribergadget_complete_visual_guide.md §10:
 *
 *   24px radius · #eef2f7 border · 16px padding · square contain image ·
 *   red pill discount badge · 14px amber stars · red price + gray old price ·
 *   full-width dark add-to-cart that turns red on hover.
 */

export interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  thumbnailUrl?: string;
  images?: { url: string; alt: string }[];
  rating: number;
}

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const requireAuth = useRequireAuth();

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // The whole card is a link, so the button must stop the click from
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

  return (
    <a href={`/product/${product.slug}`} className="gw-product-card group">
      <div className="relative p-3 md:p-4 bg-white">
        {discount > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-gw-red text-white text-xs font-bold px-2.5 py-1.5 rounded-full">
            -{discount}%
          </span>
        )}
        <img
          src={
            product.thumbnailUrl ||
            product.images?.[0]?.url ||
            `https://picsum.photos/seed/${product.slug}/400/400`
          }
          alt={product.name}
          className="w-full aspect-square object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="px-3 md:px-4 pb-3 md:pb-4">
        <h3 className="text-[15px] font-semibold text-gw-black leading-snug line-clamp-2 min-h-[2.75rem] md:min-h-[3rem]">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-1 md:mt-1.5">
          <Star className="w-3.5 h-3.5 fill-gw-yellow text-gw-yellow" />
          <span className="text-xs text-gw-gray-500">{product.rating}</span>
        </div>
        <div className="mt-1.5 md:mt-2 flex items-baseline gap-1 md:gap-2 flex-wrap">
          <span className="text-xl md:text-2xl font-extrabold text-gw-red">
            ৳{product.discountPrice || product.price}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gw-gray-400 line-through">৳{product.price}</span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToCart}
          className="mt-3 md:mt-4 w-full h-9 md:h-11 rounded-btn bg-gw-black text-white text-[11px] md:text-sm font-bold hover:bg-gw-red transition-all"
        >
          Add to Cart
        </motion.button>
      </div>
    </a>
  );
}
