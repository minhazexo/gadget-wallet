import { Container } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Smartphone, Laptop, Watch, Headphones, Gamepad2, Camera, Tablet, Cable } from "lucide-react";
import {
  staggerContainerFast,
  staggerItem,
} from "../lib/animations";

const categories = [
  { name: "Smartphones", slug: "smartphones", icon: Smartphone, count: 45 },
  { name: "Laptops", slug: "laptops", icon: Laptop, count: 32 },
  { name: "Smartwatches", slug: "smartwatches", icon: Watch, count: 28 },
  { name: "Headphones", slug: "headphones", icon: Headphones, count: 56 },
  { name: "Gaming", slug: "gaming", icon: Gamepad2, count: 41 },
  { name: "Cameras", slug: "cameras", icon: Camera, count: 19 },
  { name: "Tablets", slug: "tablets", icon: Tablet, count: 23 },
  { name: "Accessories", slug: "accessories", icon: Cable, count: 67 },
];

export default function Categories() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="section-header"
        >
          <h2>Categories</h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-gw-gray-500 mb-8 -mt-5"
        >
          Browse our wide selection of electronics
        </motion.p>

        <motion.div
          variants={staggerContainerFast}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.a
                key={cat.slug}
                variants={staggerItem}
                href={`/category/${cat.slug}`}
                whileHover={{ y: -6, boxShadow: "0 16px 32px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.97 }}
                className="bg-white border border-gw-border rounded-category p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-gw-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 md:mb-3 flex items-center justify-center">
                  <Icon className="w-full h-full text-gw-red" />
                </div>
                <h3 className="font-semibold text-gw-black group-hover:text-gw-red transition-colors">{cat.name}</h3>
                <p className="text-sm text-gw-gray-500 mt-1">{cat.count} products</p>
              </motion.a>
            );
          })}
        </motion.div>
      </Container>
    </motion.section>
  );
}
