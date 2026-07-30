import { Container, Button, Input } from "@gadget-wallet/ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Shield } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handlePlaceOrder = () => {
    navigate(`/order-success/ord_${crypto.randomUUID().slice(0, 8)}`);
  };

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
          Checkout
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-[24px] border border-gw-border p-5 md:p-6"
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gw-red text-white flex items-center justify-center text-xs md:text-sm font-bold shrink-0"
                >
                  1
                </motion.div>
                <h3 className="text-base md:text-lg font-semibold text-gw-black">Shipping Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                    className={i === 2 ? "sm:col-span-2" : ""}
                  >
                    <Input
                      label={["Full Name", "Phone", "Address", "City", "ZIP Code", "State", "Country"][i]}
                      placeholder={[
                        "John Doe",
                        "+1 (555) 000-0000",
                        "123 Main Street",
                        "San Francisco",
                        "94102",
                        "CA",
                        "United States",
                      ][i]}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <AnimatePresence>
              {step === 2 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-white rounded-[24px] border border-gw-border p-5 md:p-6 overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gw-red text-white flex items-center justify-center text-xs md:text-sm font-bold shrink-0"
                    >
                      2
                    </motion.div>
                    <h3 className="text-base md:text-lg font-semibold text-gw-black">Payment Method</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: CreditCard, title: "Credit/Debit Card", sub: "Visa, Mastercard, Amex" },
                      { icon: Shield, title: "Cash on Delivery", sub: "Pay when you receive" },
                    ].map((pay, i) => (
                      <motion.label
                        key={pay.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ x: 4, borderColor: "#e11d2e" }}
                        className="flex items-center gap-3 p-3 md:p-4 border border-gw-border rounded-xl cursor-pointer hover:border-gw-red/50 transition-all"
                      >
                        <input
                          type="radio"
                          name="payment"
                          defaultChecked={i === 0}
                          className="accent-gw-red"
                        />
                        <pay.icon className="w-4 h-4 md:w-5 md:h-5 text-gw-red shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gw-black text-sm md:text-base">{pay.title}</p>
                          <p className="text-xs md:text-sm text-gw-gray-500">{pay.sub}</p>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-[24px] border border-gw-border p-5 md:p-6 lg:sticky lg:top-[148px]">
              <h3 className="font-semibold text-lg text-gw-black mb-4">Order Summary</h3>
              <div className="space-y-2 md:space-y-3 text-sm">
                {[
                  { label: "Items (3)", value: "$1,799.97" },
                  { label: "Shipping", value: "Free", green: true },
                  { label: "Tax", value: "$143.99" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex justify-between text-gw-gray-500"
                  >
                    <span>{item.label}</span>
                    <span className={item.green ? "text-gw-green font-medium" : "text-gw-black font-medium"}>
                      {item.value}
                    </span>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="border-t border-gw-border pt-3 flex justify-between font-bold text-base md:text-lg"
                >
                  <span className="text-gw-black">Total</span>
                  <span className="text-gw-red">$1,943.96</span>
                </motion.div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="mt-5 md:mt-6"
              >
                {step === 1 ? (
                  <Button variant="primary" className="w-full h-11 md:h-12" onClick={() => setStep(2)}>
                    Continue to Payment
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Button variant="primary" className="w-full h-11 md:h-12" onClick={handlePlaceOrder}>
                      Place Order
                    </Button>
                  </motion.div>
                )}
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-center mt-3 text-gw-gray-300"
              >
                Secured with 256-bit SSL encryption
              </motion.p>
            </div>
          </motion.div>
        </div>
      </Container>
    </motion.section>
  );
}
