import { Container, Card } from "@gadget-wallet/ui";
import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-display font-bold mb-6">Terms & Conditions</h1>
          <Card className="p-8 text-gw-text-secondary leading-relaxed space-y-4">
            <p>Last updated: January 2024</p>
            <h2 className="text-xl font-semibold text-gw-text-primary">General Terms</h2>
            <p>By accessing and using Gadget Wallet, you agree to comply with these terms and conditions. All products are subject to availability and we reserve the right to modify prices without prior notice.</p>
            <h2 className="text-xl font-semibold text-gw-text-primary">Orders & Payments</h2>
            <p>All orders are subject to acceptance and availability. We reserve the right to cancel any order due to pricing errors or stock unavailability. Payment is due at the time of purchase.</p>
            <h2 className="text-xl font-semibold text-gw-text-primary">Shipping & Returns</h2>
            <p>We strive to ship all orders within 24-48 hours. Returns must be initiated within 30 days of delivery. Products must be in original condition with all accessories and packaging.</p>
            <h2 className="text-xl font-semibold text-gw-text-primary">Limitation of Liability</h2>
            <p>Gadget Wallet shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
