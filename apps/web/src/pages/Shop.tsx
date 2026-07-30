import { Container, Button } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Grid3X3, List } from "lucide-react";
import api from "../lib/api";
import {
  staggerContainerFast,
  staggerContainer,
  staggerItem,
} from "../lib/animations";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  shortDescription: string;
  rating: number;
  reviewCount: number;
  images?: { url: string; alt: string }[];
}

export default function Shop() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const url = slug ? `/products?category=${slug}` : "/products";
    api.get(url).then((res) => setProducts(res.data.data || []));
  }, [slug]);

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
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="section-header"
        >
          <div>
            <h2>{slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "All Products"}</h2>
            <p className="text-sm text-gw-gray-500 font-normal">{products.length} products found</p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-gw-red/10 text-gw-red" : "text-gw-gray-300 hover:text-gw-gray-500"}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-gw-red/10 text-gw-red" : "text-gw-gray-300 hover:text-gw-gray-500"}`}
            >
              <List className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </motion.div>

        {view === "grid" ? (
          <motion.div
            key="grid"
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5"
          >
            {products.map((product) => {
              const discount = product.discountPrice
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : 0;

              return (
                <motion.div key={product.id} variants={staggerItem}>
                  <a
                    href={`/product/${product.slug}`}
                    className="block bg-white rounded-product border border-gw-border overflow-hidden hover:-translate-y-1.5 hover:shadow-gw-lg transition-all duration-300 group"
                  >
                    <div className="relative p-5 bg-white">
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 bg-gw-red text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
                          -{discount}%
                        </span>
                      )}
                      <img
                        src={product.images?.[0]?.url || `https://picsum.photos/seed/${product.slug}/400/400`}
                        alt={product.name}
                        className="w-full aspect-square object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="px-5 pb-5">
                      <h3 className="text-sm font-semibold text-gw-black line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-3.5 h-3.5 fill-gw-yellow text-gw-yellow" />
                        <span className="text-xs text-gw-gray-500">{product.rating}</span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-gw-red">${product.discountPrice || product.price}</span>
                        {product.discountPrice && <span className="text-sm text-gw-gray-300 line-through">${product.price}</span>}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="mt-4 w-full h-11 rounded-xl bg-gw-black text-white text-sm font-bold hover:bg-gw-red transition-all"
                      >
                        Add to Cart
                      </motion.button>
                    </div>
                  </a>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-4"
          >
            {products.map((product) => {
              const discount = product.discountPrice
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : 0;

              return (
                <motion.div key={product.id} variants={staggerItem}>
                  <a
                    href={`/product/${product.slug}`}
                    className="flex bg-white rounded-[24px] border border-gw-border overflow-hidden hover:shadow-gw-md transition-all duration-300 group"
                  >
                    <div className="w-48 h-48 shrink-0 p-4 bg-white relative">
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 bg-gw-red text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
                          -{discount}%
                        </span>
                      )}
                      <img
                        src={product.images?.[0]?.url || `https://picsum.photos/seed/${product.slug}/400/400`}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                      <h3 className="text-sm font-semibold text-gw-black">{product.name}</h3>
                      <p className="text-sm text-gw-gray-500 mt-1 line-clamp-2">{product.shortDescription}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-3.5 h-3.5 fill-gw-yellow text-gw-yellow" />
                        <span className="text-xs text-gw-gray-500">{product.rating}</span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-gw-red">${product.discountPrice || product.price}</span>
                        {product.discountPrice && <span className="text-sm text-gw-gray-300 line-through">${product.price}</span>}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="mt-4 w-full h-11 rounded-xl bg-gw-black text-white text-sm font-bold hover:bg-gw-red transition-all max-w-[200px]"
                      >
                        Add to Cart
                      </motion.button>
                    </div>
                  </a>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </Container>
    </motion.section>
  );
}
