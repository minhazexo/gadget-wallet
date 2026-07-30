import { Container, Button } from "@gadget-wallet/ui";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package } from "lucide-react";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-white rounded-[24px] border border-gw-border p-6 md:p-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-gw-green mx-auto mb-5 md:mb-6" />
              </motion.div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-2xl md:text-3xl font-bold text-gw-black mb-3 md:mb-4"
            >
              Order Placed!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gw-gray-500 mb-6"
            >
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="inline-flex items-center gap-2 bg-gw-green/10 text-gw-green px-4 py-2 rounded-full mb-6"
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Order #{id}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="space-y-3"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <a href="/my-orders"><Button variant="primary" className="w-full h-12">Track Order</Button></a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <a href="/shop"><Button variant="outline" className="w-full h-12">Continue Shopping</Button></a>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </motion.section>
  );
}
