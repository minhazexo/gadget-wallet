import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "../../store/useWishlistStore";
import { SectionHeader, EmptyState, money } from "./shared";

export function WishlistSection() {
  const items = useWishlistStore((s) => s.items);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const remove = useWishlistStore((s) => s.remove);
  const moveToCart = useWishlistStore((s) => s.moveToCart);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SectionHeader title="My Wishlist" subtitle={`${items.length} saved ${items.length === 1 ? "item" : "items"}`} />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse gw-panel-category h-64" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="gw-panel-category">
          <EmptyState
            icon={<Heart className="w-16 h-16" />}
            title="Your wishlist is empty"
            subtitle="Tap the heart on any product to save it here"
            action={<Link to="/shop"><button className="px-5 py-2.5 bg-gw-red text-white text-sm font-bold rounded-btn hover:bg-gw-red-hover transition-colors">Browse Products</button></Link>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              whileHover={{ y: -4 }}
              className="gw-panel-category overflow-hidden group"
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
                  onClick={() => remove(item.productId)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-gw-sm flex items-center justify-center text-gw-red hover:bg-gw-red hover:text-white transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 pb-4">
                <Link to={`/product/${item.slug}`}>
                  <h3 className="gw-heading-sm truncate hover:text-gw-red transition-colors">{item.name}</h3>
                </Link>
                <p className="text-xl font-extrabold text-gw-red mt-1">{money(item.discountPrice || item.price)}</p>
                <button
                  onClick={() => moveToCart(item.productId)}
                  className="mt-3 w-full h-10 rounded-xl bg-gw-black text-white text-sm font-bold hover:bg-gw-red transition-colors dark:bg-gray-800 dark:hover:bg-gw-red"
                >
                  <ShoppingBag className="w-4 h-4 inline mr-2" /> Move to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
