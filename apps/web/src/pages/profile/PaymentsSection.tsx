import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { CreditCard, Smartphone, Plus, Trash2, Check, Banknote } from "lucide-react";
import { Button, Input } from "@gadget-wallet/ui";
import api from "../../lib/api";
import { showToast } from "../../store/useToastStore";
import { SectionHeader, EmptyState, Modal } from "./shared";
import type { PaymentMethodItem } from "./types";
import { cn } from "@gadget-wallet/ui";

type MethodType = "card" | "mobile_banking" | "cash_on_delivery";

interface NewMethod {
  type: MethodType;
  brand: string;
  last4: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  provider: string;
}

const emptyMethod: NewMethod = { type: "card", brand: "", last4: "", holderName: "", expiryMonth: "", expiryYear: "", provider: "" };

const brandLogos: Record<string, string> = {
  Visa: "VISA",
  Mastercard: "Mastercard",
  Amex: "AMEX",
  "American Express": "AMEX",
};

export function PaymentsSection() {
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewMethod>(emptyMethod);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/payment-methods");
      setMethods(data.data || []);
    } catch {
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    try {
      let payload: any;
      if (form.type === "card") {
        if (!/^\d{4}$/.test(form.last4)) {
          showToast("Last 4 digits are required", "error");
          return;
        }
        payload = {
          type: "card",
          brand: form.brand || "Card",
          last4: form.last4,
          holderName: form.holderName,
          expiryMonth: form.expiryMonth || "01",
          expiryYear: form.expiryYear || "2030",
          isDefault: methods.length === 0,
        };
      } else if (form.type === "mobile_banking") {
        if (!/^\d{4}$/.test(form.last4)) {
          showToast("Last 4 digits are required", "error");
          return;
        }
        payload = {
          type: "mobile_banking",
          provider: form.provider || "Mobile Banking",
          last4: form.last4,
          holderName: form.holderName,
          isDefault: methods.length === 0,
        };
      } else {
        payload = { type: "cash_on_delivery", isDefault: methods.length === 0 };
      }
      await api.post("/payment-methods", payload);
      showToast("Payment method added successfully");
      setModalOpen(false);
      setForm(emptyMethod);
      load();
    } catch {
      showToast("Failed to add payment method", "error");
    }
  };

  const remove = async (m: PaymentMethodItem) => {
    try {
      await api.delete(`/payment-methods/${m.id}`);
      showToast("Payment method removed", "info");
      load();
    } catch {
      showToast("Failed to remove payment method", "error");
    }
  };

  const setDefault = async (m: PaymentMethodItem) => {
    try {
      await api.post(`/payment-methods/${m.id}/default`);
      showToast("Default payment method updated");
      load();
    } catch {
      showToast("Failed to update default", "error");
    }
  };

  const renderIcon = (m: PaymentMethodItem) => {
    if (m.type === "mobile_banking") return <Smartphone className="w-5 h-5 text-gw-red" />;
    if (m.type === "cash_on_delivery") return <Banknote className="w-5 h-5 text-gw-red" />;
    return <CreditCard className="w-5 h-5 text-gw-red" />;
  };

  const renderLabel = (m: PaymentMethodItem) => {
    if (m.type === "cash_on_delivery") return "Cash on Delivery";
    if (m.type === "mobile_banking") {
      const providerName = m.provider?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return `${providerName || "Mobile Banking"} •••• ${m.last4}`;
    }
    return `${m.brand || "Card"} ${brandLogos[m.brand || ""] ? "••••" : "••••"} ${m.last4}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SectionHeader
        title="Payment Methods"
        subtitle="Your saved cards and mobile banking options"
        action={<Button variant="primary" size="sm" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Add Payment Method</Button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse gw-panel-category h-36" />
          ))}
        </div>
      ) : methods.length === 0 ? (
        <div className="gw-panel-category">
          <EmptyState
            icon={<CreditCard className="w-16 h-16" />}
            title="No payment methods saved"
            subtitle="Add a card or mobile banking for faster checkout"
            action={<Button variant="primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Add Payment Method</Button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map((m) => (
            <motion.div
              key={m.id}
              layout
              whileHover={{ y: -3 }}
              className={cn(
                "bg-white dark:bg-gray-900 rounded-category border p-5 transition-colors",
                m.isDefault ? "border-gw-red" : "border-gw-border dark:border-gray-700",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gw-red/10 flex items-center justify-center">{renderIcon(m)}</div>
                  <div>
                    <p className="gw-heading-sm">{renderLabel(m)}</p>
                    <p className="gw-muted-xs">
                      {m.holderName || ""}
                      {m.type === "card" && m.expiryMonth && ` · Exp ${m.expiryMonth}/${m.expiryYear}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => remove(m)} className="p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors" aria-label="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3">
                {m.isDefault ? (
                  <span className="gw-status-badge--compact text-[11px] font-bold bg-gw-red text-white">Default</span>
                ) : (
                  <button onClick={() => setDefault(m)} className="flex items-center gap-1.5 text-xs font-medium text-gw-red hover:text-gw-red-hover">
                    <Check className="w-3.5 h-3.5" /> Set as default
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title="Add Payment Method" onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["card", "mobile_banking", "cash_on_delivery"] as MethodType[]).map((t) => (
              <button
                key={t}
                onClick={() => setForm({ ...emptyMethod, type: t })}
                className={cn(
                  "flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium capitalize transition-colors",
                  form.type === t
                    ? "border-gw-red bg-gw-red/5 text-gw-red"
                    : "border-gw-border dark:border-gray-700 text-gw-gray-500 hover:border-gw-red/40",
                )}
              >
                {t === "card" ? "Card" : t === "mobile_banking" ? "Mobile Banking" : "Cash on Delivery"}
              </button>
            ))}
          </div>

          {form.type === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Card Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Visa / Mastercard / Amex" />
              <Input label="Last 4 Digits" value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} placeholder="4242" maxLength={4} />
              <div className="sm:col-span-2">
                <Input label="Cardholder Name" value={form.holderName} onChange={(e) => setForm({ ...form, holderName: e.target.value })} placeholder="John Doe" />
              </div>
              <Input label="Expiry Month (MM)" value={form.expiryMonth} onChange={(e) => setForm({ ...form, expiryMonth: e.target.value })} placeholder="12" maxLength={2} />
              <Input label="Expiry Year (YYYY)" value={form.expiryYear} onChange={(e) => setForm({ ...form, expiryYear: e.target.value })} placeholder="2030" maxLength={4} />
            </div>
          )}

          {form.type === "mobile_banking" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="bKash / Nagad / Roket" />
              <Input label="Last 4 Digits" value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} placeholder="1234" maxLength={4} />
              <div className="sm:col-span-2">
                <Input label="Account Holder Name" value={form.holderName} onChange={(e) => setForm({ ...form, holderName: e.target.value })} placeholder="John Doe" />
              </div>
            </div>
          )}

          {form.type === "cash_on_delivery" && (
            <p className="gw-muted-sm bg-gw-bg dark:bg-gray-800 rounded-xl p-4">
              Pay in cash when your order is delivered. No card details needed.
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="primary" className="flex-1" onClick={save}>Add Payment Method</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
