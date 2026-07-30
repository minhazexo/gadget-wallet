import { Container } from "@gadget-wallet/ui";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, American Express, PayPal, and Cash on Delivery for select locations." },
  { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days. Express shipping (2-3 business days) is available at checkout." },
  { q: "What is your return policy?", a: "We offer a 30-day return policy for all products. Items must be unused and in original packaging." },
  { q: "Do you offer warranty?", a: "All products come with a minimum 1-year manufacturer warranty. Extended warranty options are available." },
  { q: "Can I track my order?", a: "Yes! Once your order ships, you'll receive a tracking number via email." },
  { q: "Do you ship internationally?", a: "Yes, we ship to over 50 countries worldwide. Shipping rates vary by destination." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section>
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gw-black mb-4 text-center">Frequently Asked Questions</h1>
          <p className="text-gw-gray-500 mb-10 text-center">Find answers to common questions about our products and services.</p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gw-border rounded-[20px] overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-gw-black">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gw-gray-300 transition-transform shrink-0 ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && (
                  <div className="px-5 pb-5">
                    <p className="text-gw-gray-500">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
