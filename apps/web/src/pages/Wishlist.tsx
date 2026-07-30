import { Container, Button } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import {
  staggerContainer,
  staggerItem,
} from "../lib/animations";

const wishlistItems = [
  { id: "1", name: "MacBook Pro 16 M3 Max", price: 2499.99, image: "https://picsum.photos/seed/macbook-pro-16-m3-max/400/400" },
  { id: "2", name: "Apple Watch Ultra 2", price: 799.99, image: "https://picsum.photos/seed/apple-watch-ultra-2/400/400" },
];

export default function Wishlist() {
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
          <h2 className="text-3xl font-bold text-gw-black">My Wishlist</h2>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gw-gray-500 text-sm"
          >
            {wishlistItems.length} items
          </motion.span>
        </motion.div>

        {wishlistItems.length === 0 ? (
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
            <p className="text-gw-gray-500">Your wishlist is empty</p>
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
            {wishlistItems.map((item) => (
              <motion.div
                key={item.id}
                variants={staggerItem}
                whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-product border border-gw-border overflow-hidden group"
              >
                <div className="relative p-5 bg-white">
                  <motion.img
                    src={item.image}
                    alt={item.name}
                    className="w-full aspect-square object-contain"
                    loading="lazy"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-gw-sm flex items-center justify-center text-gw-red"
                  >
                    <Heart className="w-4 h-4 fill-gw-red" />
                  </motion.button>
                </div>
                <div className="px-5 pb-5">
                  <h3 className="text-sm font-semibold text-gw-black truncate">{item.name}</h3>
                  <p className="text-2xl font-extrabold text-gw-red mt-2">${item.price}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
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
