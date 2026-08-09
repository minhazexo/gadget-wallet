import { Container, Button } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, PackageSearch } from "lucide-react";
import api from "../lib/api";
import { staggerContainerFast, staggerItem } from "../lib/animations";
import { ProductCard, type ProductCardProduct } from "../components/ProductCard";

type Product = ProductCardProduct;

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  // Optional category filter set by the header's search dropdown (/search?category=:slug).
  const category = (searchParams.get("category") || "").trim();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!q && !category) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const params = new URLSearchParams({ limit: "50" });
    if (q) params.set("search", q);
    if (category) params.set("category", category);
    api
      .get(`/products?${params.toString()}`)
      .then((res) => setProducts(res.data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, category]);

  // Add-to-cart lives in <ProductCard/> (useRequireAuth + useCartStore) so the
  // behavior is identical across Home, Shop and Search.

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
          <div>
            <h2 className="gw-section-title">
              {q ? <>Search results for &ldquo;{q}&rdquo;</> : category ? "Category results" : "Search"}
            </h2>
            <p className="text-sm text-gw-gray-500 font-normal">
              {loading ? "Searching..." : `${products.length} product${products.length === 1 ? "" : "s"} found`}
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse gw-panel-category h-72" />
            ))}
          </div>
        ) : !q && !category ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gw-gray-300 mx-auto mb-4" />
            <p className="gw-muted mb-4">Type a query in the search bar to find products.</p>
            <Link to="/shop">
              <Button variant="primary">Browse All Products</Button>
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <PackageSearch className="w-16 h-16 text-gw-gray-300 mx-auto mb-4" />
            <p className="gw-muted mb-1">No products matched &ldquo;{q}&rdquo;</p>
            <p className="gw-muted text-sm mb-4">Try a different keyword, or browse the full catalog.</p>
            <Link to="/shop">
              <Button variant="primary">Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <motion.div
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={staggerItem}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </Container>
    </motion.section>
  );
}
