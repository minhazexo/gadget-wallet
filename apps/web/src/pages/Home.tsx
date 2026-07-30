import { motion } from "framer-motion";
import { Container, Button, Card, Badge } from "@gadget-wallet/ui";
import { ChevronDown, Star, Shield, Truck, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images?: { url: string; alt: string }[];
  rating: number;
  reviewCount: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
}

const brands = [
  { name: "Apple", color: "#555" },
  { name: "Samsung", color: "#1428A0" },
  { name: "Sony", color: "#000" },
  { name: "ASUS", color: "#000" },
  { name: "Logitech", color: "#00B8FC" },
  { name: "Dell", color: "#007DB8" },
  { name: "Bose", color: "#000" },
  { name: "Canon", color: "#000" },
];

const testimonials = [
  { name: "Alex M.", text: "Absolutely love my new MacBook! The delivery was incredibly fast and the packaging was premium.", rating: 5 },
  { name: "Sarah K.", text: "Best electronics store I've ever shopped at. The customer service is outstanding.", rating: 5 },
  { name: "James R.", text: "Got my Sony headphones at an amazing price. Will definitely be a returning customer.", rating: 5 },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/products/featured"),
      api.get("/products/new-arrivals"),
      api.get("/products/best-sellers"),
    ]).then(([f, n, b]) => {
      setFeatured(f.data.data || []);
      setNewArrivals(n.data.data || []);
      setBestSellers(b.data.data || []);
    });
  }, []);

  return (
    <div>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/3195398/3195398-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-gw-bg/80 via-gw-bg/60 to-gw-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-gw-accent/10 to-gw-accent-secondary/10" />

        <Container className="relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6"
            >
              Experience the{" "}
              <span className="gradient-text">Future</span>
              <br />of Technology
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl text-gw-text-secondary mb-10 max-w-2xl mx-auto"
            >
              Premium gadgets delivered to your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex items-center justify-center gap-4"
            >
              <Button variant="primary" size="lg">
                Shop Now
              </Button>
              <Button variant="outline" size="lg">
                Explore Collection
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 text-gw-text-secondary animate-scroll-indicator" />
          </motion.div>
        </Container>

        <div className="absolute top-1/4 left-10 w-64 h-64 bg-gw-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-gw-accent-secondary/20 rounded-full blur-[120px]" />
      </section>

      <Container className="py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Featured Products</h2>
          <p className="text-gw-text-secondary mb-10">Curated selection of our finest electronics</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </motion.div>
      </Container>

      <Container className="py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">New Arrivals</h2>
          <p className="text-gw-text-secondary mb-10">The latest gadgets just landed</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </motion.div>
      </Container>

      <Container className="py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-gw-bg/80 z-10" />
          <img
            src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200"
            alt="Gaming Collection"
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center p-10">
            <div>
              <h3 className="text-4xl font-display font-bold mb-4">Gaming Collection</h3>
              <p className="text-gw-text-secondary mb-6 max-w-md">Level up your setup with the latest gaming gear</p>
              <Button variant="secondary">Shop Gaming</Button>
            </div>
          </div>
        </motion.div>
      </Container>

      <Container className="py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Best Sellers</h2>
          <p className="text-gw-text-secondary mb-10">Most popular products our customers love</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </motion.div>
      </Container>

      <Container className="py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-l from-blue-900/80 to-gw-bg/80 z-10" />
          <img
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200"
            alt="Laptop Collection"
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-end p-10">
            <div className="text-right">
              <h3 className="text-4xl font-display font-bold mb-4">Laptop Collection</h3>
              <p className="text-gw-text-secondary mb-6 max-w-md ml-auto">Power and portability for every professional</p>
              <Button variant="primary">Shop Laptops</Button>
            </div>
          </div>
        </motion.div>
      </Container>

      <Container className="py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">Top Brands</h2>
          <p className="text-gw-text-secondary mb-10 text-center">We carry the world's most trusted brands</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <div key={brand.name} className="glass rounded-xl p-6 flex items-center justify-center hover:border-gw-accent/30 transition-all cursor-pointer">
                <span className="text-xl font-bold opacity-50 hover:opacity-100 transition-opacity">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>

      <Container className="py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">What Our Customers Say</h2>
          <p className="text-gw-text-secondary mb-10 text-center">Trusted by thousands of customers worldwide</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} glass className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gw-text-secondary mb-4">"{t.text}"</p>
                <p className="font-semibold text-gw-text-primary">{t.name}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </Container>

      <Container className="py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl font-display font-bold mb-4">Stay Updated</h2>
          <p className="text-gw-text-secondary mb-8 max-w-md mx-auto">
            Subscribe to get notified about new arrivals, exclusive deals, and tech news.
          </p>
          <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-gw-bg border border-white/10 rounded-lg text-gw-text-primary placeholder:text-gw-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gw-accent/50"
            />
            <Button variant="primary">Subscribe</Button>
          </div>
        </motion.div>
      </Container>

      <Container className="pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card glass className="p-6 flex items-start gap-4">
            <Shield className="w-8 h-8 text-gw-accent shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">2-Year Warranty</h3>
              <p className="text-sm text-gw-text-secondary">All products covered by manufacturer warranty</p>
            </div>
          </Card>
          <Card glass className="p-6 flex items-start gap-4">
            <Truck className="w-8 h-8 text-gw-accent shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Free Shipping</h3>
              <p className="text-sm text-gw-text-secondary">Free delivery on orders over $100</p>
            </div>
          </Card>
          <Card glass className="p-6 flex items-start gap-4">
            <RotateCcw className="w-8 h-8 text-gw-accent shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">30-Day Returns</h3>
              <p className="text-sm text-gw-text-secondary">Hassle-free returns within 30 days</p>
            </div>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.a
      href={`/product/${product.slug}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-gw-surface">
          <img
            src={product.images?.[0]?.url || `https://picsum.photos/seed/${product.slug}/400/400`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNewArrival && <Badge variant="new">New</Badge>}
            {product.isBestSeller && <Badge variant="best">Best Seller</Badge>}
            {product.discountPrice && <Badge variant="sale">Sale</Badge>}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm group-hover:text-gw-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gw-text-secondary">{product.rating} ({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {product.discountPrice ? (
              <>
                <span className="text-lg font-bold text-gw-accent">${product.discountPrice}</span>
                <span className="text-sm text-gw-text-secondary line-through">${product.price}</span>
              </>
            ) : (
              <span className="text-lg font-bold">${product.price}</span>
            )}
          </div>
        </div>
      </Card>
    </motion.a>
  );
}
