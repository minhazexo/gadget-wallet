import { Container, Button } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
  staggerContainer,
  staggerItem,
} from "../lib/animations";
import { useCartStore, selectCartSummary } from "../store/useCartStore";
import { showToast } from "../store/useToastStore";

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  useEffect(() => {
    useCartStore.getState().load();
  }, []);

  const { count, subtotal } = selectCartSummary(items);

  const handleRemove = async (productId: string, name: string) => {
    try {
      await removeItem(productId);
      showToast(`${name} removed from cart`, "info");
    } catch {
      showToast("Failed to remove item", "error");
    }
  };

  const handleQty = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateQuantity(productId, quantity);
    } catch {
      showToast("Failed to update quantity", "error");
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <section className="gw-section">
        <Container>
          <div className="py-24 text-center text-gw-gray-500 animate-pulse">Loading cart...</div>
        </Container>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Container>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="gw-page-title"
        >
          Shopping Cart {count > 0 && <span className="text-gw-red">({count})</span>}
        </motion.h2>

        {items.length === 0 ? (
          <div className="gw-empty">
            <ShoppingBag className="w-12 h-12 mx-auto text-gw-gray-300 mb-4" />
            <p className="gw-muted mb-4">Your cart is empty.</p>
            <Link to="/shop">
              <Button variant="primary">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 space-y-3 md:space-y-4"
            >
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  variants={staggerItem}
                  layout
                  className="gw-panel p-4 md:p-5"
                >
                  <div className="flex items-start md:items-center gap-3 md:gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden bg-white border border-gw-border shrink-0 p-2 md:p-3"
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="gw-heading-md truncate">{item.name}</h3>
                      <p className="text-lg md:text-xl font-extrabold text-gw-red mt-0.5 md:mt-1">
                        ৳{Number(item.discountPrice || item.price).toFixed(2)}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemove(item.productId, item.name)}
                      // p-2.5 keeps the hit area ≥ 40px on touch.
                      className="p-2.5 md:p-2 text-gw-gray-300 hover:text-gw-red transition-colors shrink-0 -mt-1 md:mt-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-0 md:border-t-0 border-t border-gw-border dark:border-gray-700">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center border border-gw-border dark:border-gray-700 rounded-xl"
                    >
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleQty(item.productId, item.quantity - 1)}
                        className="p-2.5 md:p-2 hover:text-gw-red transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </motion.button>
                      <span className="px-3 md:px-4 gw-heading-md">{item.quantity}</span>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleQty(item.productId, item.quantity + 1)}
                        className="p-2.5 md:p-2 hover:text-gw-red transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </motion.button>
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-bold text-gw-black dark:text-white text-sm md:text-base"
                    >
                      ৳{(Number(item.discountPrice || item.price) * item.quantity).toFixed(2)}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="gw-panel p-5 md:p-6 lg:sticky lg:top-[148px]">
                <h3 className="gw-heading-lg mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gw-muted">
                    <span>Subtotal ({count} items)</span>
                    <span className="gw-text-body font-medium">৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gw-muted">
                    <span>Shipping</span>
                    <span className="text-gw-green font-medium">Free</span>
                  </div>
                  <div className="border-t border-gw-border dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
                    <span className="gw-text-body">Total</span>
                    <span className="text-gw-red">৳{subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 md:mt-6"
                >
                  <Link to="/checkout">
                    <Button variant="primary" className="w-full h-11 md:h-12">Proceed to Checkout</Button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link to="/shop">
                    <Button variant="ghost" className="w-full mt-2">
                      <ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </Container>
    </motion.section>
  );
}
