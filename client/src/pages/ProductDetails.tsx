import { Container, Button, Badge } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Share2, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import { cachedGet } from "../lib/cachedGet";
import api from "../lib/api";

// Per-session dedup so rapid back/forward navigation (where the product is
// served from the TTL cache) doesn't fire a /recently-viewed POST each time.
const recentlyViewedLogged = new Set<string>();
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useAuthStore } from "../store/useAuthStore";
import { showToast } from "../store/useToastStore";
import { useRequireAuth } from "../lib/useRequireAuth";
import {
  staggerContainer,
  staggerItem,
} from "../lib/animations";
import { SectionReveal } from "../components/PageTransition";

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  shortDescription: string;
  fullDescription: string;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images?: { url: string; alt: string; isPrimary?: boolean }[];
  specs?: { key: string; value: string }[];
}

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const wishlistItems = useWishlistStore((s) => s.items);
  const requireAuth = useRequireAuth();

  useEffect(() => {
    if (!slug) return;
    // One fetch shared for both rendering and the recently-viewed log — the
    // product data is never fetched twice for the same slug.
    cachedGet<{ data: Product }>(`/products/${slug}`, 60_000).then((body) => {
      const p = body.data;
      setProduct(p);
      // Open the gallery on the primary (cover) image when available.
      const primaryIdx = p?.images?.findIndex((i: { isPrimary?: boolean }) => i.isPrimary) ?? -1;
      if (primaryIdx >= 0) setSelectedImage(primaryIdx);
      if (useAuthStore.getState().user && p?.id && !recentlyViewedLogged.has(p.id)) {
        recentlyViewedLogged.add(p.id);
        api.post("/recently-viewed", { productId: p.id }).catch(() => {});
      }
    });
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-pulse text-gw-gray-500"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isWishlisted = wishlistItems.some((i) => i.productId === product.id);

  const handleAddToCart = async () => {
    if (!requireAuth()) return; // guests must sign in before adding to cart
    try {
      await addToCart(product.id, quantity);
      showToast("Added to cart");
    } catch {
      showToast("Failed to add to cart", "error");
    }
  };

  const handleBuyNow = () => {
    // Guests go to login first and land straight in checkout afterwards.
    if (!requireAuth(`/checkout?buyNow=1&productId=${product.id}&qty=${quantity}`)) return;
    navigate(`/checkout?buyNow=1&productId=${product.id}&qty=${quantity}`);
  };

  const handleWishlist = async () => {
    if (!requireAuth()) return; // wishlist is a signed-in feature
    const added = await toggleWishlist(product.id);
    if (added !== undefined) {
      showToast(added ? "Added to wishlist" : "Removed from wishlist", "info");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          {/* Left: Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="aspect-square rounded-product overflow-hidden bg-white border border-gw-border mb-3 md:mb-4 p-6 md:p-8"
            >
              <img
                src={product.images?.[selectedImage]?.url || `https://picsum.photos/seed/${slug}/800/800`}
                alt={product.name}
                className="w-full h-full object-contain"
                fetchPriority="high"
                decoding="async"
              />
            </motion.div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {product.images.map((img, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-colors bg-white p-1.5 md:p-2 shrink-0 ${
                      selectedImage === i ? "border-gw-red" : "border-gw-border"
                    }`}
                  >
                    <img src={img.url} alt={img.alt} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-3 flex-wrap"
            >
              {product.isNewArrival && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.3 }}>
                  <Badge variant="new">New</Badge>
                </motion.div>
              )}
              {product.isBestSeller && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.4 }}>
                  <Badge>Best Seller</Badge>
                </motion.div>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-2xl md:text-3xl font-bold text-gw-black mb-3 md:mb-4"
            >
              {product.name}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-1 mb-3 md:mb-4"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  key={star}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4 + star * 0.05, type: "spring", stiffness: 300 }}
                >
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-gw-yellow text-gw-yellow" />
                </motion.div>
              ))}
              <span className="font-semibold text-gw-black text-sm md:text-base ml-1">{product.rating}</span>
              <span className="text-gw-gray-500 text-sm">({product.reviewCount} reviews)</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-gw-gray-500 text-sm md:text-base mb-5 md:mb-6 leading-relaxed"
            >
              {product.shortDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-baseline gap-2 md:gap-3 mb-5 md:mb-6 flex-wrap"
            >
              <span className="text-3xl md:text-4xl font-extrabold text-gw-red">৳{product.discountPrice || product.price}</span>
              {product.discountPrice && (
                <>
                  <span className="text-lg md:text-xl text-gw-gray-400 line-through">৳{product.price}</span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="text-xs md:text-sm font-bold text-gw-green bg-gw-green/10 px-2 md:px-2.5 py-0.5 rounded-full"
                  >
                    Save ৳{(product.price - product.discountPrice).toFixed(2)}
                  </motion.span>
                </>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 md:mb-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center border border-gw-border rounded-xl self-start"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 md:p-3 hover:text-gw-red transition-colors"
                >
                  <Minus className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
                <span className="px-4 md:px-5 py-2.5 md:py-3 font-semibold min-w-[36px] md:min-w-[40px] text-center text-gw-black text-sm md:text-base">
                  {quantity}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 md:p-3 hover:text-gw-red transition-colors"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
              </motion.div>
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button variant="dark" size="lg" className="w-full h-11 md:h-12 text-sm" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              </motion.div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1, borderColor: "#e11d2e", color: "#e11d2e" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlist}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center transition-all"
                  aria-label="Add to wishlist"
                  style={{
                    borderColor: isWishlisted ? "#e11d2e" : undefined,
                    color: isWishlisted ? "#e11d2e" : undefined,
                  }}
                >
                  <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isWishlisted ? "fill-gw-red" : ""}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, borderColor: "#e11d2e", color: "#e11d2e" }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-gw-border flex items-center justify-center text-gw-gray-300 hover:text-gw-red hover:border-gw-red transition-all"
                >
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button variant="primary" size="lg" className="w-full mb-6 md:mb-8 h-11 md:h-12 text-sm" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </motion.div>

            {/* Service features */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 md:mb-8"
            >
              {[
                { icon: Truck, label: "Free Shipping", sub: "On orders ৳2,000+" },
                { icon: Shield, label: "2 Year Warranty", sub: "Official" },
                { icon: RotateCcw, label: "30-Day Returns", sub: "Hassle free" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={staggerItem}
                  whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(0,0,0,0.06)" }}
                  className="bg-white border border-gw-border rounded-xl p-3 md:p-4 text-center transition-all"
                >
                  <item.icon className="w-5 h-5 md:w-6 md:h-6 text-gw-red mx-auto mb-1 md:mb-1.5" />
                  <p className="text-[11px] md:text-xs font-semibold text-gw-black">{item.label}</p>
                  <p className="text-[10px] md:text-[11px] text-gw-gray-500">{item.sub}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-gw-gray-500 space-y-1"
            >
              <p>SKU: <span className="text-gw-black font-medium">{product.sku}</span></p>
              <p>Stock: <span className={product.stock > 0 ? "text-gw-green font-medium" : "text-gw-red font-medium"}>
                {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
              </span></p>
            </motion.div>
          </motion.div>
        </div>

        {/* Full Details & Specs */}
        <SectionReveal>
          <div className="mt-12 md:mt-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl font-bold text-gw-black mb-5 md:mb-6"
            >
              Product Details
            </motion.h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gw-gray-500 text-sm md:text-base leading-relaxed">{product.fullDescription}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="gw-panel-light overflow-hidden"
              >
                <div className="divide-y divide-gw-border">
                  {product.specs
                    ?.filter((s) => s.key !== "keywords" && !s.key.startsWith("meta_"))
                    .map((spec, i) => (
                    <motion.div
                      key={spec.key}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex justify-between py-3 px-4 md:px-5"
                    >
                      <span className="text-gw-gray-500 text-xs md:text-sm">{spec.key}</span>
                      <span className="font-medium text-xs md:text-sm text-gw-black">{spec.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </SectionReveal>
      </Container>
    </motion.section>
  );
}
