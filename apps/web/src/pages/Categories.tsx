import { Container } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Laptop, Watch, Headphones, Gamepad2, Camera, Tablet, Cable, Package } from "lucide-react";
import {
  staggerContainerFast,
  staggerItem,
} from "../lib/animations";
import api from "../lib/api";

const iconMap: Record<string, any> = {
  smartphones: Smartphone,
  laptops: Laptop,
  smartwatches: Watch,
  headphones: Headphones,
  gaming: Gamepad2,
  cameras: Camera,
  tablets: Tablet,
  accessories: Cable,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.data || []))
      .catch(() => setCategories([]));
  }, []);

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
          className="gw-section-header"
        >
          <h2 className="gw-section-title">Categories</h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="gw-muted mb-8 -mt-5"
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
            const Icon = iconMap[cat.slug] || Package;
            return (
              <motion.a
                key={cat.slug}
                variants={staggerItem}
                href={`/category/${cat.slug}`}
                whileHover={{ y: -6, boxShadow: "0 16px 32px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.97 }}
                className="gw-panel-category p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-gw-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 md:mb-3 flex items-center justify-center">
                  <Icon className="w-full h-full text-gw-red" />
                </div>
                <h3 className="gw-heading group-hover:text-gw-red transition-colors">{cat.name}</h3>
                <p className="gw-muted-sm mt-1">{cat.count} products</p>
              </motion.a>
            );
          })}
        </motion.div>
      </Container>
    </motion.section>
  );
}
