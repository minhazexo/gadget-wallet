import { Container, Button, Card, Input } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Shield } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handlePlaceOrder = () => {
    const orderId = "ord_" + crypto.randomUUID().slice(0, 8);
    navigate(`/order-success/${orderId}`);
  };

  return (
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gw-accent text-gw-bg flex items-center justify-center text-sm font-bold">1</div>
                  <h2 className="text-lg font-semibold">Shipping Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" placeholder="John Doe" />
                  <Input label="Phone" placeholder="+1 (555) 000-0000" />
                  <div className="md:col-span-2">
                    <Input label="Address" placeholder="123 Main Street" />
                  </div>
                  <Input label="City" placeholder="San Francisco" />
                  <Input label="ZIP Code" placeholder="94102" />
                  <Input label="State" placeholder="CA" />
                  <Input label="Country" placeholder="United States" />
                </div>
              </Card>

              {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gw-accent text-gw-bg flex items-center justify-center text-sm font-bold">2</div>
                      <h2 className="text-lg font-semibold">Payment Method</h2>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 border border-white/10 rounded-lg cursor-pointer hover:border-gw-accent/50 transition-colors">
                        <input type="radio" name="payment" defaultChecked className="accent-gw-accent" />
                        <CreditCard className="w-5 h-5 text-gw-accent" />
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-gw-text-secondary">Visa, Mastercard, Amex</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-white/10 rounded-lg cursor-pointer hover:border-gw-accent/50 transition-colors">
                        <input type="radio" name="payment" className="accent-gw-accent" />
                        <Shield className="w-5 h-5 text-gw-accent" />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-gw-text-secondary">Pay when you receive</p>
                        </div>
                      </label>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>

            <div>
              <Card className="p-6 sticky top-24">
                <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gw-text-secondary">
                    <span>Items (3)</span>
                    <span>$1,799.97</span>
                  </div>
                  <div className="flex justify-between text-gw-text-secondary">
                    <span>Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between text-gw-text-secondary">
                    <span>Tax</span>
                    <span>$143.99</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>$1,943.96</span>
                  </div>
                </div>
                {step === 1 ? (
                  <Button variant="primary" className="w-full mt-6" onClick={() => setStep(2)}>
                    Continue to Payment
                  </Button>
                ) : (
                  <Button variant="primary" className="w-full mt-6" onClick={handlePlaceOrder}>
                    Place Order
                  </Button>
                )}
                <p className="text-xs text-gw-text-secondary text-center mt-3">
                  Secured with 256-bit SSL encryption
                </p>
              </Card>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
