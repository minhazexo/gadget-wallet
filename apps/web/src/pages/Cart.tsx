import { Container, Button, Card } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const cartItems = [
  { id: "1", name: "iPhone 15 Pro Max", price: 1099.99, quantity: 1, image: "https://picsum.photos/seed/iphone-15-pro-max/200/200" },
  { id: "2", name: "Sony WH-1000XM5", price: 349.99, quantity: 2, image: "https://picsum.photos/seed/sony-wh-1000xm5/200/200" },
];

export default function Cart() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-4 flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gw-surface shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    <p className="text-gw-accent font-bold mt-1">${item.price}</p>
                  </div>
                  <div className="flex items-center border border-white/10 rounded-lg">
                    <button className="p-1.5 hover:text-gw-accent"><Minus className="w-4 h-4" /></button>
                    <span className="px-3 font-semibold">{item.quantity}</span>
                    <button className="p-1.5 hover:text-gw-accent"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button className="p-2 text-red-400 hover:text-red-300">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gw-text-secondary">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gw-text-secondary">
                  <span>Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout">
                <Button variant="primary" className="w-full mt-6">Proceed to Checkout</Button>
              </Link>
              <Link to="/shop">
                <Button variant="ghost" className="w-full mt-2">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
