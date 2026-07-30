import { Container } from "@gadget-wallet/ui";

export default function Terms() {
  return (
    <section>
      <Container>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gw-black mb-6">Terms & Conditions</h2>
          <div className="bg-white border border-gw-border rounded-[24px] p-8 text-gw-gray-500 leading-relaxed space-y-4">
            <p className="text-sm text-gw-gray-300">Last updated: January 2024</p>
            <h3 className="text-xl font-semibold text-gw-black">General Terms</h3>
            <p>By accessing and using Gadget Wallet, you agree to comply with these terms and conditions. All products are subject to availability and we reserve the right to modify prices without prior notice.</p>
            <h3 className="text-xl font-semibold text-gw-black">Orders & Payments</h3>
            <p>All orders are subject to acceptance and availability. We reserve the right to cancel any order due to pricing errors or stock unavailability. Payment is due at the time of purchase.</p>
            <h3 className="text-xl font-semibold text-gw-black">Shipping & Returns</h3>
            <p>We strive to ship all orders within 24-48 hours. Returns must be initiated within 30 days of delivery. Products must be in original condition with all accessories and packaging.</p>
            <h3 className="text-xl font-semibold text-gw-black">Limitation of Liability</h3>
            <p>Gadget Wallet shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
