import { Container, Card } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Smartphone, Laptop, Watch, Headphones, Gamepad2, Camera, Tablet, Cable } from "lucide-react";

const categories = [
  { name: "Smartphones", slug: "smartphones", icon: Smartphone, count: 45, color: "from-blue-500/20 to-blue-500/5" },
  { name: "Laptops", slug: "laptops", icon: Laptop, count: 32, color: "from-purple-500/20 to-purple-500/5" },
  { name: "Smartwatches", slug: "smartwatches", icon: Watch, count: 28, color: "from-green-500/20 to-green-500/5" },
  { name: "Headphones", slug: "headphones", icon: Headphones, count: 56, color: "from-red-500/20 to-red-500/5" },
  { name: "Gaming", slug: "gaming", icon: Gamepad2, count: 41, color: "from-yellow-500/20 to-yellow-500/5" },
  { name: "Cameras", slug: "cameras", icon: Camera, count: 19, color: "from-pink-500/20 to-pink-500/5" },
  { name: "Tablets", slug: "tablets", icon: Tablet, count: 23, color: "from-cyan-500/20 to-cyan-500/5" },
  { name: "Accessories", slug: "accessories", icon: Cable, count: 67, color: "from-orange-500/20 to-orange-500/5" },
];

export default function Categories() {
  return (
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-4">Categories</h1>
          <p className="text-gw-text-secondary mb-10">Browse our wide selection of electronics</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.a
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className={`p-6 bg-gradient-to-br ${cat.color} border-white/5 hover:border-gw-accent/30 transition-all`}>
                    <Icon className="w-10 h-10 text-gw-accent mb-4" />
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <p className="text-sm text-gw-text-secondary mt-1">{cat.count} products</p>
                  </Card>
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
