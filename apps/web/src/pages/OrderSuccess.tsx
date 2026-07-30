import { Container, Button, Card } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <Card className="p-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold mb-4">Order Placed!</h1>
            <p className="text-gw-text-secondary mb-6">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-lg mb-6">
              <Package className="w-5 h-5" />
              <span className="font-medium">Order #{id}</span>
            </div>
            <div className="space-y-3">
              <a href="/my-orders">
                <Button variant="primary" className="w-full">Track Order</Button>
              </a>
              <a href="/shop">
                <Button variant="outline" className="w-full">Continue Shopping</Button>
              </a>
            </div>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
