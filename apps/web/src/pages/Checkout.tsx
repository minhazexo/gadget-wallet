import { Container, Button, Input } from "@gadget-wallet/ui";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Shield, Banknote, Smartphone, Zap } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { showToast } from "../store/useToastStore";
import api from "../lib/api";

interface LineItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);
  const cartItems = useCartStore((s) => s.items);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<LineItem | null>(null);
  const [buyNowQty, setBuyNowQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [address, setAddress] = useState({ label: "", street: "", city: "", state: "", zip: "", country: "" });

  const isBuyNow = searchParams.get("buyNow") === "1";
  const productId = searchParams.get("productId");
  const qtyParam = parseInt(searchParams.get("qty") || "1", 10);

  // Checkout is for signed-in customers only — send guests to login and bring
  // them straight back here once they sign in.
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { state: { from: location.pathname + location.search } });
    }
  }, [authLoading, user, navigate, location]);

  // Load buy-now product directly (bypasses cart)
  useEffect(() => {
    if (isBuyNow && productId) {
      api
        .get(`/products/by-id/${productId}`)
        .then((res) => {
          const p = res.data.data;
          setBuyNowItem({
            productId: p.id,
            name: p.name,
            image: p.images?.[0]?.url || `https://picsum.photos/seed/${p.slug}/400/400`,
            price: Number(p.discountPrice || p.price),
            quantity: qtyParam,
          });
          setBuyNowQty(qtyParam);
        })
        .catch(() => showToast("Product not found", "error"));
    }
  }, [isBuyNow, productId, qtyParam]);

  // Prefill shipping address from default saved address
  useEffect(() => {
    if (user) {
      api
        .get("/profile")
        .then((res) => {
          const addr = res.data.data?.defaultAddress;
          if (addr) setAddress(addr);
        })
        .catch(() => {});
    }
  }, [user]);

  const items: LineItem[] = useMemo(() => {
    if (isBuyNow) return buyNowItem ? [buyNowItem] : [];
    return cartItems.map((it) => ({
      productId: it.productId,
      name: it.name,
      image: it.image || `https://picsum.photos/seed/${it.slug}/200/200`,
      price: Number(it.discountPrice || it.price),
      quantity: it.quantity,
    }));
  }, [isBuyNow, buyNowItem, cartItems]);

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const shipping = 0;
  const tax = subtotal * 0.08;
  const total = subtotal + tax + shipping;

  const paymentOptions = [
    { value: "card", icon: CreditCard, title: "Credit/Debit Card", sub: "Visa, Mastercard, Amex" },
    { value: "mobile_banking", icon: Smartphone, title: "Mobile Banking", sub: "bKash, Nagad, Rocket" },
    { value: "cod", icon: Banknote, title: "Cash on Delivery", sub: "Pay when you receive" },
  ];

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    if (!address.street || !address.city || !address.country) {
      showToast("Please fill in your shipping address", "error");
      return;
    }
    if (items.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }
    setLoading(true);
    try {
      // Find or create the shipping address
      let addressId: string | null = null;
      const existing = await api.get("/address");
      const match = existing.data.data?.find(
        (a: any) =>
          a.street === address.street &&
          a.city === address.city &&
          a.state === address.state &&
          a.zip === address.zip,
      );
      if (match) {
        addressId = match.id;
      } else {
        const created = await api.post("/address", {
          label: address.label || "Checkout",
          street: address.street,
          city: address.city,
          state: address.state || "—",
          zip: address.zip,
          country: address.country,
          isDefault: (existing.data.data || []).length === 0,
        });
        addressId = created.data.data.id;
      }

      const { data } = await api.post("/orders", {
        items: items.map((it) => ({ productId: it.productId, quantity: it.quantity, price: it.price })),
        subtotal: Number(subtotal.toFixed(2)),
        discount: 0,
        shipping,
        total: Number(total.toFixed(2)),
        paymentMethod,
        shippingAddressId: addressId,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      });

      showToast("Order placed successfully");
      // Clear cart after order (only in cart mode)
      if (!isBuyNow) {
        for (const it of cartItems) {
          await api
            .delete("/cart/remove", { data: { productId: it.productId, userId: user.id } })
            .catch(() => {});
        }
        useCartStore.getState().clearCart();
      }
      navigate(`/order-success/${data.data.id}`);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to place order", "error");
    } finally {
      setLoading(false);
    }
  };

  const addressFields = [
    { key: "label", label: "Address Label", placeholder: "Home / Office" },
    { key: "street", label: "Street Address", placeholder: "123 Main Street" },
    { key: "city", label: "City", placeholder: "San Francisco" },
    { key: "state", label: "State", placeholder: "CA" },
    { key: "zip", label: "ZIP Code", placeholder: "94102" },
    { key: "country", label: "Country", placeholder: "United States" },
  ] as const;

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Container>
        <motion.div className="flex items-center gap-2 mb-6 md:mb-8">
          <h2 className="gw-title">Checkout</h2>
          {isBuyNow && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gw-red/10 text-gw-red text-xs font-bold">
              <Zap className="w-3.5 h-3.5" /> Buy Now
            </span>
          )}
        </motion.div>

        {items.length === 0 ? (
          <div className="gw-empty">
            <p className="gw-muted mb-4">Nothing to checkout yet.</p>
            <Button variant="primary" onClick={() => navigate("/shop")}>Browse Products</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Step 1: Shipping */}
              <div className="gw-panel p-5 md:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="gw-step-badge">1</div>
                  <h3 className="gw-heading-lg">Shipping Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addressFields.map((f) => (
                    <Input
                      key={f.key}
                      label={f.label}
                      placeholder={f.placeholder}
                      value={address[f.key]}
                      onChange={(e) => setAddress((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  ))}
                </div>
              </div>

              {/* Step 2: Payment */}
              <AnimatePresence>
                {step === 2 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="gw-panel p-5 md:p-6 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="gw-step-badge">2</div>
                      <h3 className="gw-heading-lg">Payment Method</h3>
                    </div>
                    <div className="space-y-3">
                      {paymentOptions.map((pay, i) => (
                        <motion.label
                          key={pay.value}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all"
                          style={{ borderColor: paymentMethod === pay.value ? "#e11d2e" : undefined }}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === pay.value}
                            onChange={() => setPaymentMethod(pay.value)}
                            className="accent-gw-red"
                          />
                          <pay.icon className="w-5 h-5 text-gw-red shrink-0" />
                          <div>
                            <p className="gw-text-body font-medium">{pay.title}</p>
                            <p className="gw-muted-sm">{pay.sub}</p>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div>
              <div className="gw-panel p-5 md:p-6 lg:sticky lg:top-[148px]">
                <h3 className="gw-heading-lg mb-4">Order Summary</h3>
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {items.map((it, i) => (
                    <div key={it.productId} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white border border-gw-border p-1 overflow-hidden shrink-0">
                        <img src={it.image} alt={it.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium gw-text-body truncate">{it.name}</p>
                        <p className="gw-muted-xs">Qty: {it.quantity}</p>
                      </div>
                      <p className="gw-heading-sm">${(it.price * it.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 mt-4 text-sm gw-muted-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span className="gw-text-body font-medium">${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span className="text-gw-green font-medium">Free</span></div>
                  <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                  <div className="border-t border-gw-border dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
                    <span className="gw-text-body">Total</span>
                    <span className="text-gw-red">${total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-5">
                  {step === 1 ? (
                    <Button variant="primary" className="w-full h-12" onClick={() => setStep(2)}>
                      Continue to Payment
                    </Button>
                  ) : (
                    <Button variant="primary" className="w-full h-12" isLoading={loading} onClick={handlePlaceOrder}>
                      Place Order — ${total.toFixed(2)}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-center mt-3 text-gw-gray-300 dark:text-gray-600 flex items-center justify-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Secured with 256-bit SSL encryption
                </p>
              </div>
            </div>
          </div>
        )}
      </Container>
    </motion.section>
  );
}
