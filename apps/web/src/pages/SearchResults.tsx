import { Container } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function SearchResults() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gw-gray-300" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-4 h-[52px] bg-white border border-gw-border rounded-full text-gw-black placeholder:text-gw-gray-300 focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red transition-all"
            />
          </motion.div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center text-gw-gray-500"
        >
          Showing results for your search query
        </motion.p>
      </Container>
    </motion.section>
  );
}
