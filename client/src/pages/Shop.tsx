import { Container } from "@gadget-wallet/ui";
import { useEffect, useState, type ReactNode } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Grid3X3,
  List,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import api from "../lib/api";
import { useCartStore } from "../store/useCartStore";
import { showToast } from "../store/useToastStore";
import { useRequireAuth } from "../lib/useRequireAuth";
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
  thumbnailUrl?: string;
  images?: { url: string; alt: string }[];
  stock?: number;
  brandName?: string;
}

interface FacetItem {
  name: string;
  slug?: string;
  count: number;
}

interface Facets {
  brands: FacetItem[];
  colors: FacetItem[];
  priceRange: { min: number; max: number };
}

interface FilterState {
  brands: string[];
  colors: string[];
  minPrice: string;
  maxPrice: string;
  minRating: string;
  discount: boolean;
  inStock: boolean;
  sort: string;
}

const DEFAULT_FILTERS: FilterState = {
  brands: [],
  colors: [],
  minPrice: "",
  maxPrice: "",
  minRating: "",
  discount: false,
  inStock: false,
  sort: "newest",
};

const DEFAULT_FACETS: Facets = { brands: [], colors: [], priceRange: { min: 0, max: 0 } };

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "discount", label: "Biggest Discount" },
  { value: "popular", label: "Most Reviewed" },
];

const RATING_OPTIONS = [
  { value: "4", label: "4 & up" },
  { value: "3", label: "3 & up" },
  { value: "2", label: "2 & up" },
  { value: "1", label: "1 & up" },
];

const COLOR_HEX: Record<string, string> = {
  black: "#111111",
  white: "#ffffff",
  blue: "#2563eb",
  gray: "#6b7280",
  grey: "#6b7280",
  silver: "#c0c0c0",
  yellow: "#f59e0b",
  red: "#dc2626",
  green: "#16a34a",
  gold: "#d4a017",
  purple: "#7c3aed",
};

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <h4 className="text-[13px] font-bold text-gw-black uppercase tracking-wider mb-2.5">{title}</h4>
      {children}
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
  count,
  dot,
}: {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  count?: number;
  dot?: string;
}) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer select-none group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded accent-[#e11d2e] shrink-0"
      />
      <span className="flex-1 min-w-0 flex items-center gap-2 text-sm text-gw-gray-500 group-hover:text-gw-black transition-colors">
        {dot && (
          <span
            className="h-4 w-4 rounded-full border shrink-0"
            style={{ backgroundColor: dot, borderColor: dot === "#ffffff" ? "#d1d5db" : dot }}
          />
        )}
        <span className="truncate">{label}</span>
      </span>
      {count !== undefined && <span className="text-xs text-gray-400 shrink-0">{count}</span>}
    </label>
  );
}

export default function Shop() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const brand = searchParams.get("brand");
  const [products, setProducts] = useState<Product[]>([]);
  const [facets, setFacets] = useState<Facets>(DEFAULT_FACETS);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const addToCart = useCartStore((s) => s.addItem);
  const requireAuth = useRequireAuth();

  const handleAddToCart = async (id: string, name: string) => {
    if (!requireAuth()) return; // guests must sign in before adding to cart
    try {
      await addToCart(id);
      showToast(`${name} added to cart`);
    } catch {
      showToast("Failed to add to cart", "error");
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (brand) params.set("brand", brand);
    params.set("limit", "100");
    if (filters.brands.length) params.set("brands", filters.brands.join(","));
    if (filters.colors.length) params.set("colors", filters.colors.join(","));
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.minRating) params.set("minRating", filters.minRating);
    if (filters.discount) params.set("discount", "1");
    if (filters.inStock) params.set("inStock", "1");
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    const qs = params.toString();

    api
      .get(`/products${qs ? `?${qs}` : ""}`)
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data.data || []);
        setFacets(res.data.facets || DEFAULT_FACETS);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, brand, filters]);

  const toggleList = (key: "brands" | "colors", value: string) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const activeCount =
    filters.brands.length +
    filters.colors.length +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.discount ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.sort !== "newest" ? 1 : 0);

  const clearAll = () => setFilters(DEFAULT_FILTERS);

  const title = brand
    ? brand.charAt(0).toUpperCase() + brand.slice(1)
    : slug
      ? slug.charAt(0).toUpperCase() + slug.slice(1)
      : "All Products";

  const FilterSidebar = (
    <div className="w-full lg:w-60 xl:w-64 shrink-0 bg-white rounded-card border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-extrabold text-gw-black uppercase tracking-wide">
          Filters {activeCount > 0 && <span className="ml-1 text-gw-red">({activeCount})</span>}
        </h3>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-semibold text-gw-red hover:text-gw-red-hover transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* 7. Sort By */}
      <FilterGroup title="Sort By">
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            className="w-full h-9 rounded-btn border border-gray-200 bg-white pl-3 pr-8 text-sm outline-none focus:border-gw-red appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </FilterGroup>

      {/* 1. Brand */}
      <FilterGroup title="Brand">
        <div className="max-h-52 overflow-y-auto pr-1">
          {facets.brands.length === 0 && (
            <p className="text-xs text-gray-400">No brands available</p>
          )}
          {facets.brands.map((b) => (
            <CheckRow
              key={b.slug}
              checked={filters.brands.includes(b.slug || b.name)}
              onChange={() => toggleList("brands", b.slug || b.name)}
              label={b.name}
              count={b.count}
            />
          ))}
        </div>
      </FilterGroup>

      {/* 2. Color */}
      <FilterGroup title="Color">
        <div className="max-h-52 overflow-y-auto pr-1">
          {facets.colors.length === 0 && (
            <p className="text-xs text-gray-400">No colors available</p>
          )}
          {facets.colors.map((c) => (
            <CheckRow
              key={c.name}
              checked={filters.colors.includes(c.name)}
              onChange={() => toggleList("colors", c.name)}
              label={c.name}
              count={c.count}
              dot={COLOR_HEX[c.name.toLowerCase()] || "#e5e7eb"}
            />
          ))}
        </div>
      </FilterGroup>

      {/* 3. Price Range */}
      <FilterGroup title="Price Range">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">৳</span>
            <input
              type="number"
              min={0}
              value={filters.minPrice}
              onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
              placeholder={facets.priceRange.min ? String(Math.round(facets.priceRange.min)) : "Min"}
              className="w-full h-9 pl-6 pr-2 text-sm border border-gray-200 rounded-btn outline-none focus:border-gw-red [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <span className="text-gray-400 text-sm">–</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">৳</span>
            <input
              type="number"
              min={0}
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
              placeholder={facets.priceRange.max ? String(Math.round(facets.priceRange.max)) : "Max"}
              className="w-full h-9 pl-6 pr-2 text-sm border border-gray-200 rounded-btn outline-none focus:border-gw-red [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </FilterGroup>

      {/* 4. Rating */}
      <FilterGroup title="Rating">
        {RATING_OPTIONS.map((r) => (
          <CheckRow
            key={r.value}
            checked={filters.minRating === r.value}
            onChange={() =>
              setFilters((f) => ({
                ...f,
                minRating: f.minRating === r.value ? "" : r.value,
              }))
            }
            label={
              <>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Number(r.value)
                          ? "fill-gw-yellow text-gw-yellow"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </span>
                <span className="text-xs text-gw-gray-500">{r.label}</span>
              </>
            }
          />
        ))}
      </FilterGroup>

      {/* 5. Discount */}
      <FilterGroup title="Discount">
        <CheckRow
          checked={filters.discount}
          onChange={() => setFilters((f) => ({ ...f, discount: !f.discount }))}
          label="On Sale / Discounted"
        />
      </FilterGroup>

      {/* 6. Availability */}
      <FilterGroup title="Availability">
        <CheckRow
          checked={filters.inStock}
          onChange={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}
          label="In Stock Only"
        />
      </FilterGroup>
    </div>
  );

  const Toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="lg:hidden flex items-center gap-2 h-9 px-3 rounded-btn border border-gray-200 text-sm font-semibold text-gw-black hover:border-gw-red hover:text-gw-red transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="h-5 min-w-5 px-1 rounded-full bg-gw-red text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
        <p className="text-sm text-gw-gray-500">
          <span className="font-semibold text-gw-black">{products.length}</span> products
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Grid3X3
          className={`w-5 h-5 cursor-pointer transition-colors ${view === "grid" ? "text-gw-red" : "text-gw-gray-300 hover:text-gw-gray-500"}`}
          onClick={() => setView("grid")}
        />
        <List
          className={`w-5 h-5 cursor-pointer transition-colors ${view === "list" ? "text-gw-red" : "text-gw-gray-300 hover:text-gw-gray-500"}`}
          onClick={() => setView("list")}
        />
      </div>
    </div>
  );

  const EmptyState = (
    <div className="py-20 text-center">
      <p className="text-gw-gray-500 font-medium">No products found</p>
      <p className="text-sm text-gw-gray-400 mt-1">Try adjusting or clearing your filters.</p>
      <button
        onClick={clearAll}
        className="mt-4 h-10 px-5 rounded-btn bg-gw-black text-white text-sm font-bold hover:bg-gw-red transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );

  const Skeleton = (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="gw-panel-category animate-pulse rounded-card" />
      ))}
    </div>
  );

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
          className="gw-section-header"
        >
          <div>
            <h2 className="gw-section-title">{title}</h2>
            <p className="text-sm text-gw-gray-500 font-normal">
              {products.length} products found
            </p>
          </div>
        </motion.div>

        <div className="lg:flex lg:gap-6 lg:items-start">
          {/* Filters — sticky on desktop, collapsible on mobile */}
          <aside className="lg:sticky lg:top-24 h-fit shrink-0 hidden lg:block">
            {FilterSidebar}
          </aside>

          <div className="flex-1 min-w-0">
            {Toolbar}

            {/* Mobile filter panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="lg:hidden overflow-hidden mb-5"
                >
                  {FilterSidebar}
                </motion.div>
              )}
            </AnimatePresence>

            {loading && products.length === 0 ? (
              Skeleton
            ) : products.length === 0 ? (
              EmptyState
            ) : view === "grid" ? (
              <motion.div
                key="grid"
                variants={staggerContainerFast}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {products.map((product) => {
                  const discount = product.discountPrice
                    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                    : 0;

                  return (
                    <motion.div key={product.id} variants={staggerItem}>
                      <a
                        href={`/product/${product.slug}`}
                        className="gw-product-card group"
                      >
                        <div className="relative p-3 md:p-5 bg-white">
                          {discount > 0 && (
                            <span className="gw-status-badge absolute top-3 left-3 z-10 bg-gw-red text-white font-bold">
                              -{discount}%
                            </span>
                          )}
                          <div className="relative w-full aspect-square">
                            <img
                              src={product.thumbnailUrl || product.images?.[0]?.url || `https://picsum.photos/seed/${product.slug}/400/400`}
                              alt={product.name}
                              className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105 group-hover:opacity-0"
                              loading="lazy"
                            />
                            {product.images && product.images.length > 1 && (
                              <img
                                src={product.images[1].url}
                                alt=""
                                aria-hidden
                                className="absolute inset-0 w-full h-full object-contain opacity-0 scale-105 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100"
                                loading="lazy"
                              />
                            )}
                          </div>
                        </div>
                        <div className="px-3 md:px-5 pb-3 md:pb-5">
                          <h3 className="text-[15px] font-semibold text-gw-black leading-snug line-clamp-2 min-h-[2.75rem] md:min-h-[3rem]">{product.name}</h3>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star className="w-3.5 h-3.5 fill-gw-yellow text-gw-yellow" />
                            <span className="text-xs text-gw-gray-500">{product.rating}</span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-1 md:gap-2 flex-wrap">
                            <span className="text-xl md:text-2xl font-extrabold text-gw-red">৳{product.discountPrice || product.price}</span>
                            {product.discountPrice && <span className="text-sm text-gw-gray-400 line-through">৳{product.price}</span>}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAddToCart(product.id, product.name)}
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
                        className="gw-product-card-row group"
                      >
                        <div className="w-24 h-24 sm:w-48 sm:h-48 shrink-0 p-2 sm:p-4 bg-white relative">
                          {discount > 0 && (
                            <span className="gw-status-badge absolute top-3 left-3 z-10 bg-gw-red text-white font-bold">
                              -{discount}%
                            </span>
                          )}
                          <div className="relative w-full h-full">
                            <img
                              src={product.thumbnailUrl || product.images?.[0]?.url || `https://picsum.photos/seed/${product.slug}/400/400`}
                              alt={product.name}
                              className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105 group-hover:opacity-0"
                              loading="lazy"
                            />
                            {product.images && product.images.length > 1 && (
                              <img
                                src={product.images[1].url}
                                alt=""
                                aria-hidden
                                className="absolute inset-0 w-full h-full object-contain opacity-0 scale-105 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100"
                                loading="lazy"
                              />
                            )}
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-center">
                          <h3 className="text-[15px] font-semibold text-gw-black leading-snug">{product.name}</h3>
                          <p className="text-sm text-gw-gray-500 mt-1 line-clamp-2">{product.shortDescription}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star className="w-3.5 h-3.5 fill-gw-yellow text-gw-yellow" />
                            <span className="text-xs text-gw-gray-500">{product.rating}</span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-1 md:gap-2 flex-wrap">
                            <span className="text-xl md:text-2xl font-extrabold text-gw-red">৳{product.discountPrice || product.price}</span>
                            {product.discountPrice && <span className="text-sm text-gw-gray-400 line-through">৳{product.price}</span>}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAddToCart(product.id, product.name)}
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
          </div>
        </div>
      </Container>
    </motion.section>
  );
}
