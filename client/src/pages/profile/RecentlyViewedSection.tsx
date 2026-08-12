import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { History, ShoppingCart, Zap, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { showToast } from "../../store/useToastStore";
import { useRequireAuth } from "../../lib/useRequireAuth";
import { SectionHeader, EmptyState, money } from "./shared";
import type { RecentlyViewedItem } from "./types";
import api from "../../lib/api";
import { cn } from "@gadget-wallet/ui";

export function RecentlyViewedSection() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/recently-viewed");
      setItems(data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddToCart = async (item: RecentlyViewedItem) => {
    if (!requireAuth()) return; // guests must sign in before adding to cart
    try {
      await addToCart(item.productId);
      showToast("Added to cart");
    } catch {
      showToast("Failed to add to cart", "error");
    }
  };

  const handleBuyNow = (item: RecentlyViewedItem) => {
    if (!requireAuth(`/checkout?buyNow=1&productId=${item.productId}&qty=1`)) return;
    navigate(`/checkout?buyNow=1&productId=${item.productId}&qty=1`);
  };

  const handleToggleWishlist = (item: RecentlyViewedItem) => {
    if (!requireAuth()) return; // wishlist is a signed-in feature
    toggleWishlist(item.productId);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SectionHeader title="Recently Viewed" subtitle="Pick up where you left off" />

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse gw-panel-category w-52 h-64 shrink-0" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="gw-panel-category">
          <EmptyState
            icon={<History className="w-16 h-16" />}
            title="No recently viewed products"
            subtitle="Products you browse will show up here"
            action={<Link to="/shop"><button className="px-5 py-2.5 bg-gw-red text-white text-sm font-bold rounded-btn hover:bg-gw-red-hover transition-colors">Browse Products</button></Link>}
          />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className="shrink-0 w-52 gw-panel-category overflow-hidden group"
            >
              <div className="relative p-4 bg-white">
                <Link to={`/product/${item.slug}`}>
                  <img
                    src={item.image || `https://picsum.photos/seed/${item.slug}/400/400`}
                    alt={item.name}
                    className="w-full aspect-square object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
                <button
                  onClick={() => handleToggleWishlist(item)}
                  className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white shadow-gw-sm flex items-center justify-center text-gw-gray-300 hover:text-gw-red transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 pb-4">
                <Link to={`/product/${item.slug}`}>
                  <h3 className="gw-heading-sm truncate hover:text-gw-red transition-colors">{item.name}</h3>
                </Link>
                <p className="text-lg font-extrabold text-gw-red mt-1">{money(item.discountPrice || item.price)}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    // h-11 = 44px touch target.
                    className="flex-1 h-11 rounded-xl bg-gw-black text-white text-xs font-bold hover:bg-gw-red transition-colors dark:bg-gray-800 dark:hover:bg-gw-red"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 inline mr-1" /> Cart
                  </button>
                  <button
                    onClick={() => handleBuyNow(item)}
                    className={cn("flex-1 h-11 rounded-xl bg-gw-red text-white text-xs font-bold hover:bg-gw-red-hover transition-colors")}
                  >
                    <Zap className="w-3.5 h-3.5 inline mr-1" /> Buy
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
