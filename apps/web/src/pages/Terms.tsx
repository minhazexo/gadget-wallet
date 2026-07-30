import { Container, Card } from "@gadget-wallet/ui";

export default function Terms() {
  return (
    <section>
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gw-black mb-6">Terms & Conditions</h1>
          <Card className="p-8 text-gw-gray-500 leading-relaxed space-y-4">
            <p>Last updated: January 2024</p>
            <h2 className="text-xl font-semibold text-gw-black">General Terms</h2>
            <p>By accessing and using Gadget Wallet, you agree to comply with these terms and conditions. All products are subject to availability and we reserve the right to modify prices without prior notice.</p>
            <h2 className="text-xl font-semibold text-gw-black">Orders & Payments</h2>
            <p>All orders are subject to acceptance and availability. We reserve the right to cancel any order due to pricing errors or stock unavailability. Payment is due at the time of purchase.</p>
            <h2 className="text-xl font-semibold text-gw-black">Shipping & Returns</h2>
            <p>We strive to ship all orders within 24-48 hours. Returns must be initiated within 30 days of delivery. Products must be in original condition with all accessories and packaging.</p>
            <h2 className="text-xl font-semibold text-gw-black">Limitation of Liability</h2>
            <p>Gadget Wallet shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
          </Card>
        </div>
      </Container>
    </section>
  );
}
