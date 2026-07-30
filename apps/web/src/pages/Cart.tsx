import { Container, Button, Card } from "@gadget-wallet/ui";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const cartItems = [
  { id: "1", name: "iPhone 15 Pro Max", price: 1099.99, quantity: 1, image: "https://picsum.photos/seed/iphone-15-pro-max/200/200" },
  { id: "2", name: "Sony WH-1000XM5", price: 349.99, quantity: 2, image: "https://picsum.photos/seed/sony-wh-1000xm5/200/200" },
];

export default function Cart() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section>
      <Container>
        <h2 className="text-3xl font-bold text-gw-black mb-8">Shopping Cart</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-[24px] border border-gw-border p-5 flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-gw-border shrink-0 p-3">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gw-black truncate">{item.name}</h3>
                  <p className="text-xl font-extrabold text-gw-red mt-1">${item.price}</p>
                </div>
                <div className="flex items-center border border-gw-border rounded-xl">
                  <button className="p-2 hover:text-gw-red transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="px-4 font-semibold text-gw-black">{item.quantity}</span>
                  <button className="p-2 hover:text-gw-red transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <button className="p-2 text-gw-gray-300 hover:text-gw-red transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-white rounded-[24px] border border-gw-border p-6 sticky top-[148px]">
              <h3 className="font-semibold text-lg text-gw-black mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gw-gray-500">
                  <span>Subtotal</span>
                  <span className="text-gw-black font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gw-gray-500">
                  <span>Shipping</span>
                  <span className="text-gw-green font-medium">Free</span>
                </div>
                <div className="border-t border-gw-border pt-3 flex justify-between font-bold text-lg">
                  <span className="text-gw-black">Total</span>
                  <span className="text-gw-red">${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout">
                <Button variant="primary" className="w-full mt-6 h-12">Proceed to Checkout</Button>
              </Link>
              <Link to="/shop">
                <Button variant="ghost" className="w-full mt-2">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
