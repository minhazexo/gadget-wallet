import { Container, Button } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import {
  staggerContainer,
  staggerItem,
  lineItem,
  fadeIn,
} from "../lib/animations";

const cartItems = [
  { id: "1", name: "iPhone 15 Pro Max", price: 1099.99, quantity: 1, image: "https://picsum.photos/seed/iphone-15-pro-max/200/200" },
  { id: "2", name: "Sony WH-1000XM5", price: 349.99, quantity: 2, image: "https://picsum.photos/seed/sony-wh-1000xm5/200/200" },
];

export default function Cart() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
          className="text-2xl md:text-3xl font-bold text-gw-black mb-6 md:mb-8"
        >
          Shopping Cart
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-3 md:space-y-4"
          >
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                variants={staggerItem}
                layout
                className="bg-white rounded-[24px] border border-gw-border p-4 md:p-5"
              >
                <div className="flex items-start md:items-center gap-3 md:gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden bg-white border border-gw-border shrink-0 p-2 md:p-3"
                  >
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gw-black text-sm md:text-base truncate">{item.name}</h3>
                    <p className="text-lg md:text-xl font-extrabold text-gw-red mt-0.5 md:mt-1">${item.price}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 md:p-2 text-gw-gray-300 hover:text-gw-red transition-colors shrink-0 -mt-1 md:mt-0"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>
                </div>
                <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-0 md:border-t-0 border-t border-gw-border">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center border border-gw-border rounded-xl"
                  >
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 md:p-2 hover:text-gw-red transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </motion.button>
                    <span className="px-3 md:px-4 font-semibold text-gw-black text-sm md:text-base">{item.quantity}</span>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 md:p-2 hover:text-gw-red transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </motion.button>
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-bold text-gw-black text-sm md:text-base"
                  >
                    ${(item.price * item.quantity).toFixed(2)}
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
            <div className="bg-white rounded-[24px] border border-gw-border p-5 md:p-6 lg:sticky lg:top-[148px]">
              <h3 className="font-semibold text-lg text-gw-black mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-between text-gw-gray-500"
                >
                  <span>Subtotal</span>
                  <span className="text-gw-black font-medium">${subtotal.toFixed(2)}</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex justify-between text-gw-gray-500"
                >
                  <span>Shipping</span>
                  <span className="text-gw-green font-medium">Free</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="border-t border-gw-border pt-3 flex justify-between font-bold text-lg"
                >
                  <span className="text-gw-black">Total</span>
                  <span className="text-gw-red">${subtotal.toFixed(2)}</span>
                </motion.div>
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
      </Container>
    </motion.section>
  );
}
