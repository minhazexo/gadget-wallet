import { Container, Button, Card, Input } from "@gadget-wallet/ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Shield } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handlePlaceOrder = () => {
    navigate(`/order-success/ord_${crypto.randomUUID().slice(0, 8)}`);
  };

  return (
    <section>
      <Container>
        <h2 className="text-3xl font-bold text-gw-black mb-8">Checkout</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[24px] border border-gw-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gw-red text-white flex items-center justify-center text-sm font-bold">1</div>
                <h3 className="text-lg font-semibold text-gw-black">Shipping Information</h3>
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
            </div>

            {step === 2 && (
              <div className="bg-white rounded-[24px] border border-gw-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gw-red text-white flex items-center justify-center text-sm font-bold">2</div>
                  <h3 className="text-lg font-semibold text-gw-black">Payment Method</h3>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-gw-border rounded-xl cursor-pointer hover:border-gw-red/50 transition-colors">
                    <input type="radio" name="payment" defaultChecked className="accent-gw-red" />
                    <CreditCard className="w-5 h-5 text-gw-red" />
                    <div>
                      <p className="font-medium text-gw-black">Credit/Debit Card</p>
                      <p className="text-sm text-gw-gray-500">Visa, Mastercard, Amex</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gw-border rounded-xl cursor-pointer hover:border-gw-red/50 transition-colors">
                    <input type="radio" name="payment" className="accent-gw-red" />
                    <Shield className="w-5 h-5 text-gw-red" />
                    <div>
                      <p className="font-medium text-gw-black">Cash on Delivery</p>
                      <p className="text-sm text-gw-gray-500">Pay when you receive</p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white rounded-[24px] border border-gw-border p-6 sticky top-[148px]">
              <h3 className="font-semibold text-lg text-gw-black mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gw-gray-500">
                  <span>Items (3)</span>
                  <span className="text-gw-black font-medium">$1,799.97</span>
                </div>
                <div className="flex justify-between text-gw-gray-500">
                  <span>Shipping</span>
                  <span className="text-gw-green font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gw-gray-500">
                  <span>Tax</span>
                  <span className="text-gw-black font-medium">$143.99</span>
                </div>
                <div className="border-t border-gw-border pt-3 flex justify-between font-bold text-lg">
                  <span className="text-gw-black">Total</span>
                  <span className="text-gw-red">$1,943.96</span>
                </div>
              </div>
              {step === 1 ? (
                <Button variant="primary" className="w-full mt-6 h-12" onClick={() => setStep(2)}>
                  Continue to Payment
                </Button>
              ) : (
                <Button variant="primary" className="w-full mt-6 h-12" onClick={handlePlaceOrder}>
                  Place Order
                </Button>
              )}
              <p className="text-xs text-center mt-3 text-gw-gray-300">Secured with 256-bit SSL encryption</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
