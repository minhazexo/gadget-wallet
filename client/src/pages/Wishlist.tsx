import { Container, Button } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  staggerContainer,
  staggerItem,
} from "../lib/animations";
import { useWishlistStore } from "../store/useWishlistStore";
import { useAuthStore } from "../store/useAuthStore";

export default function Wishlist() {
  const items = useWishlistStore((s) => s.items);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const remove = useWishlistStore((s) => s.remove);
  const moveToCart = useWishlistStore((s) => s.moveToCart);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    useWishlistStore.getState().load();
  }, [user]);

  const handleMoveToCart = async (productId: string) => {
    try {
      await moveToCart(productId);
    } catch {
      // handled by store toast
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <h2 className="gw-title">My Wishlist</h2>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="gw-muted text-sm"
          >
            {items.length} items
          </motion.span>
        </motion.div>

        {!user ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gw-gray-300 mx-auto mb-4" />
            <p className="gw-muted mb-4">Sign in to see your saved products</p>
            <Button variant="primary" onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        ) : isLoading && items.length === 0 ? (
          <div className="text-center py-20 text-gw-gray-500 animate-pulse">Loading...</div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <Heart className="w-16 h-16 text-gw-gray-300 mx-auto mb-4" />
            </motion.div>
            <p className="gw-muted">Your wishlist is empty</p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4"
            >
              <Link to="/shop"><Button variant="primary">Browse Products</Button></Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5"
          >
            {items.map((item) => (
              <motion.div
                key={item.productId}
                variants={staggerItem}
                whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(0,0,0,0.1)" }}
                className="gw-panel overflow-hidden group"
              >
                <div className="relative p-5 bg-white">
                  <Link to={`/product/${item.slug}`}>
                    <motion.img
                      src={item.image}
                      alt={item.name}
                      className="w-full aspect-square object-contain"
                      loading="lazy"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => remove(item.productId)}
                    // 40px min touch target.
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-gw-sm flex items-center justify-center text-gw-red"
                    aria-label={`Remove ${item.name} from wishlist`}
                  >
                    <Heart className="w-4 h-4 fill-gw-red" />
                  </motion.button>
                </div>
                <div className="px-5 pb-5">
                  <h3 className="text-sm font-semibold text-gw-black truncate">{item.name}</h3>
                  <p className="text-2xl font-extrabold text-gw-red mt-2">
                    ৳{Number(item.discountPrice || item.price).toFixed(2)}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleMoveToCart(item.productId)}
                    className="mt-4 w-full h-11 rounded-xl bg-gw-black text-white text-sm font-bold hover:bg-gw-red transition-all"
                  >
                    <ShoppingBag className="w-4 h-4 inline mr-2" /> Add to Cart
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </Container>
    </motion.section>
  );
}
