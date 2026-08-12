import { Container, Button } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Truck, Shield, Wallet, Lock } from "lucide-react";
import { cachedGet } from "../lib/cachedGet";

// Animated internal link (motion + react-router Link in one component).
const MotionLink = motion.create(Link);
import {
  heroContainer,
  heroItem,
  staggerContainer,
  staggerItem,
  staggerContainerFast,
} from "../lib/animations";
import { SectionReveal } from "../components/PageTransition";
import { ProductCard } from "../components/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  thumbnailUrl?: string;
  /** Light list projection — first gallery image (fallback when no thumbnail). */
  firstImageUrl?: string;
  images?: { url: string; alt: string }[];
  rating: number;
  reviewCount: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  count: number;
}


interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

/** Loading placeholder for product/category grids — matches the real tile
    proportions so no layout shift happens when data arrives. */
function GridSkeleton({ count = 10, cols = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" }: { count?: number; cols?: string }) {
  return (
    <div className={`grid ${cols} gap-3 md:gap-5`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-product border border-[#eef2f7] overflow-hidden bg-white dark:bg-gray-900"
        >
          <div className="aspect-square bg-gw-gray-200 dark:bg-gray-800" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-full bg-gw-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-3 w-2/3 bg-gw-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-8 w-1/2 bg-gw-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

const reviews = [
  { name: "Alex M.", text: "Absolutely love my new MacBook! The delivery was incredibly fast and the packaging was premium.", rating: 5 },
  { name: "Sarah K.", text: "Best electronics store I've ever shopped at. The customer service is outstanding.", rating: 5 },
  { name: "James R.", text: "Got my Sony headphones at an amazing price. Will definitely be a returning customer.", rating: 5 },
  { name: "Emma L.", text: "The iPhone arrived in 2 days. Authentic product with official warranty. Highly recommended!", rating: 5 },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [onSale, setOnSale] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  // True until the first batch of catalog data is in — drives the skeletons.
  const [loading, setLoading] = useState(true);

  // Mark the skeleton phase over once the first two sections have SETTLED
  // (success OR failure) — a dead API must show an empty section, not a
  // forever-skeleton.
  useEffect(() => {
    let settled = 0;
    const settle = () => {
      settled += 1;
      if (settled >= 2) setLoading(false);
    };
    // Each section fetches independently so one failing endpoint can never
    // blank the others. cachedGet dedupes + caches (5 min for catalog
    // references, 60 s for product grids) so remounts don't re-hit the API.
    cachedGet<{ data: Product[] }>("/products/featured", 60_000)
      .then((f) => setFeatured(f.data || []))
      .catch(() => {})
      .finally(settle);
    cachedGet<{ data: Product[] }>("/products/new-arrivals", 60_000)
      .then((n) => setNewArrivals(n.data || []))
      .catch(() => {})
      .finally(settle);
    // Flash Sale shows products that are actually discounted — never reuse
    // the featured grid, which mixed in non-discounted items with fake
    // "Sale" badges.
    cachedGet<{ data: Product[] }>("/products?sale=1&limit=5", 60_000).then((s) => setOnSale(s.data || [])).catch(() => {});
    // Popular Categories comes from the DB so admin-managed category photos
    // (and any future category) show up here automatically.
    cachedGet<{ data: Category[] }>("/categories", 5 * 60_000).then((c) => setCategories(c.data || [])).catch(() => {});
    // Top Brands comes from the DB so admin-managed brand logos (and any
    // future brand) show up here automatically.
    cachedGet<{ data: Brand[] }>("/brands", 5 * 60_000).then((b) => setBrands(b.data || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="pt-0 pb-8 md:pb-12">
        <Container>
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="visible"
            className="relative min-h-[320px] md:min-h-[420px] lg:min-h-[520px] rounded-hero overflow-hidden bg-gw-black"
          >
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img
                src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1320&q=80"
                alt="Hero"
                className="absolute inset-0 w-full h-full object-cover"
                fetchPriority="high"
                decoding="async"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/25 z-10" />
            <div className="relative z-20 flex items-center justify-center md:justify-start min-h-[320px] md:min-h-[420px] lg:min-h-[520px] px-6 md:px-16">
              <motion.div variants={heroItem} className="max-w-[520px] text-center md:text-left">
                <p className="text-gw-red font-semibold text-xs md:text-sm mb-2 md:mb-3 tracking-wider uppercase">
                  Premium Electronics Store
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-[56px] font-extrabold text-white leading-tight mb-3 md:mb-4">
                  Experience the Future of Technology
                </h1>
                <p className="text-white/70 text-sm md:text-lg mb-6 md:mb-8 max-w-[420px] mx-auto md:mx-0">
                  Premium gadgets delivered to your doorstep with official warranty.
                </p>
                <motion.div variants={heroItem} className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Link to="/shop">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="primary" size="lg" className="rounded-full px-6 md:px-8 h-11 md:h-12 text-xs md:text-sm">
                        Shop Now
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/categories">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="lg" className="rounded-full px-6 md:px-8 h-11 md:h-12 text-xs md:text-sm border-white/30 text-white hover:bg-white/10">
                        Explore Collection
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ── Service Strip ── */}
      {/* gw-below-fold: content-visibility lets the browser skip render/layout
          work for these off-screen sections on mobile until scrolled to. */}
      <SectionReveal className="gw-below-fold">
        <Container>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
          >
            {[
              { icon: Truck, title: "Fast Delivery", desc: "2-5 business days" },
              { icon: Shield, title: "Official Warranty", desc: "100% authentic products" },
              { icon: Wallet, title: "Cash on Delivery", desc: "Pay when you receive" },
              { icon: Lock, title: "Secure Payment", desc: "256-bit SSL encrypted" },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem}
                whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
                className="flex items-center gap-3 bg-white border border-gw-border rounded-category p-4 md:p-5 transition-shadow"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gw-red/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 md:w-6 md:h-6 text-gw-red" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gw-black truncate">{item.title}</p>
                  <p className="text-xs text-gw-gray-500 truncate">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </SectionReveal>

      {/* ── Popular Categories ── */}
      <SectionReveal className="gw-below-fold">
        <Container>
          <div className="gw-section-header">
            <h2 className="gw-section-title">Popular Categories</h2>
            <Link to="/categories" className="gw-section-link">View All &rarr;</Link>
          </div>
          <motion.div
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
          >
            {categories.slice(0, 6).map((cat) => (
              <motion.div
                key={cat.slug}
                variants={staggerItem}
              >
                <MotionLink
                  to={`/category/${cat.slug}`}
                  whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
                  whileTap={{ scale: 0.96 }}
                  className="block bg-white border border-gw-border rounded-category p-4 md:p-6 text-center transition-shadow duration-300 group"
                >
                  <img
                    src={cat.image || `https://picsum.photos/seed/${cat.slug}/128`}
                    alt={cat.name}
                    loading="lazy"
                    decoding="async"
                    className="w-12 h-12 md:w-16 md:h-16 object-contain mx-auto mb-2 md:mb-3"
                  />
                  <p className="text-xs md:text-sm font-semibold text-gw-black group-hover:text-gw-red transition-colors">{cat.name}</p>
                </MotionLink>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </SectionReveal>

      {/* ── Featured Products ── */}
      <SectionReveal className="gw-below-fold">
        <Container>
          <div className="gw-section-header">
            <h2 className="gw-section-title">Featured Products</h2>
            <Link to="/shop" className="gw-section-link">View All &rarr;</Link>
          </div>
          <motion.div
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5"
          >
            {loading ? (
              <GridSkeleton count={10} />
            ) : (
              featured.slice(0, 10).map((product) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </motion.div>
        </Container>
      </SectionReveal>

      {/* ── Flash Sale ── */}
      {onSale.length > 0 && (
      <SectionReveal className="gw-below-fold">
        <Container>
          <div className="gw-section-header">
            <h2 className="gw-section-title">Flash Sale</h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 md:gap-3"
            >
              <div className="flex gap-1 md:gap-1.5">
                {[
                  { label: "02", unit: "Hours" },
                  { label: "45", unit: "Mins" },
                  { label: "30", unit: "Secs" },
                ].map((t) => (
                  <motion.div
                    key={t.unit}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gw-black text-white flex flex-col items-center justify-center"
                  >
                    <span className="text-base md:text-lg font-extrabold leading-none">{t.label}</span>
                    <span className="text-[9px] md:text-[10px] text-white/60">{t.unit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          <motion.div
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5"
          >
            {loading ? (
              <GridSkeleton count={5} />
            ) : (
              onSale.slice(0, 5).map((product) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </motion.div>
        </Container>
      </SectionReveal>
      )}

      {/* ── New Arrivals ── */}
      <SectionReveal className="gw-below-fold">
        <Container>
          <div className="gw-section-header">
            <h2 className="gw-section-title">New Arrivals</h2>
            <Link to="/shop" className="gw-section-link">View All &rarr;</Link>
          </div>
          <motion.div
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5"
          >
            {loading ? (
              <GridSkeleton count={10} />
            ) : (
              newArrivals.slice(0, 10).map((product) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </motion.div>
        </Container>
      </SectionReveal>

      {/* ── Top Brands ── */}
      <SectionReveal className="gw-below-fold">
        <Container>
          <div className="gw-section-header">
            <h2 className="gw-section-title">Top Brands</h2>
          </div>
          <motion.div
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5"
          >
            {brands.slice(0, 12).map((brand) => (
              <motion.div
                key={brand.id}
                variants={staggerItem}
              >
                <MotionLink
                  to={`/shop?brand=${brand.slug}`}
                  whileHover={{ y: -5, boxShadow: "0 16px 32px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.97 }}
                  className="block bg-white border border-gw-border rounded-card p-5 md:p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 group"
                >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white border border-gw-border p-2.5 flex items-center justify-center overflow-hidden group-hover:border-gw-red/30 transition-colors">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-lg md:text-xl font-extrabold text-gw-gray-400 group-hover:text-gw-red transition-colors">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-[11px] md:text-sm font-bold text-gw-black group-hover:text-gw-red transition-colors text-center leading-tight">
                  {brand.name}
                </span>
                </MotionLink>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </SectionReveal>

      {/* ── Reviews ── */}
      <SectionReveal className="gw-below-fold">
        <Container>
          <div className="gw-section-header">
            <h2 className="gw-section-title">What Our Customers Say</h2>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {reviews.map((r, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.08)" }}
                className="gw-panel-light p-5 md:p-6 transition-all"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-1 mb-3"
                >
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.1 + i * 0.05, type: "spring", stiffness: 300 }}
                    >
                      <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-gw-yellow text-gw-yellow" />
                    </motion.div>
                  ))}
                </motion.div>
                <p className="text-sm text-gw-gray-500 mb-4 leading-relaxed">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gw-red/10 flex items-center justify-center text-sm md:text-base font-bold text-gw-red shrink-0">
                    {r.name[0]}
                  </div>
                  <p className="text-sm font-semibold text-gw-black">{r.name}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </SectionReveal>

      {/* ── Newsletter ── */}
      <SectionReveal className="gw-below-fold">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-gw-black rounded-newsletter p-8 md:p-12 text-center"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3"
            >
              Stay Updated
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-white/60 text-sm md:text-base mb-6 md:mb-8 max-w-md mx-auto"
            >
              Subscribe to get notified about new arrivals, exclusive deals, and tech news.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:flex-1 h-[48px] md:h-[52px] px-5 md:px-6 rounded-full border-none bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gw-red/50 text-sm"
              />
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button variant="primary" className="w-full sm:w-auto rounded-full px-6 md:px-8 h-[48px] md:h-[52px] text-sm">
                  Subscribe
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </Container>
      </SectionReveal>
    </div>
  );
}
