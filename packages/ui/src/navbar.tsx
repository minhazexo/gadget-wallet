import { cn } from "./utils";
import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  LayoutDashboard,
  Phone,
  Clock,
  Truck,
} from "lucide-react";

/**
 * Storefront header — 3-layer clone of goribergadget.com:
 *
 *   1. TOP BAR      dark (#111827), 36px — hotline / hours | track / wishlist / login
 *   2. MAIN HEADER  white, ~76px — logo | [category ▼ + search + red button] | labeled icons
 *   3. NAV BAR      white, 48px — centered nav links
 *
 * Design tokens follow the header spec: Poppins font, #E60023 primary red,
 * 1200px container. The top bar scrolls away; the main header + nav bar stick.
 */

export interface HeaderCategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Shown while live categories load (or if the fetch fails) so the category
// dropdown in the search bar is never empty. Mirror the seeded categories.
const FALLBACK_CATEGORIES: HeaderCategory[] = [
  { id: "1", name: "Smartphones", slug: "smartphones" },
  { id: "2", name: "Laptops", slug: "laptops" },
  { id: "3", name: "Audio", slug: "audio" },
  { id: "4", name: "Wearables", slug: "wearables" },
  { id: "5", name: "Gaming", slug: "gaming" },
  { id: "6", name: "Accessories", slug: "accessories" },
];

interface NavbarProps {
  isLoggedIn?: boolean;
  cartCount?: number;
  wishlistCount?: number;
  userName?: string;
  categories?: HeaderCategory[];
  onLogout?: () => void;
}

export function Navbar({
  isLoggedIn = false,
  cartCount = 0,
  wishlistCount = 0,
  userName = "",
  categories,
  onLogout,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [badgeBounce, setBadgeBounce] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const allCategories = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  // Navigate to the search results page with the chosen category filter.
  const submitSearch = (e?: FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    const q = query.trim();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (!q && !category) return; // don't navigate on an empty search
    window.location.href = `/search${params.toString() ? `?${params.toString()}` : ""}`;
    setQuery("");
  };

  // The top bar scrolls away; only the main header + nav row stick.
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Trigger badge bounce when cart count changes
  useEffect(() => {
    if (cartCount > 0) {
      setBadgeBounce(true);
      const timer = setTimeout(() => setBadgeBounce(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const isActive = (href: string) => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname;
    if (href === "/") return path === "/";
    if (href === "/categories") return path === "/categories" || path.startsWith("/category/");
    return path.startsWith(href);
  };

  return (
    <header className="font-poppins">
      {/* ── Layer 1: Top Bar (dark, scrolls away) ─────────────────────────── */}
      <div className="bg-gray-900 text-white text-[13px]">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-9">
          <div className="flex items-center gap-4 min-w-0">
            <a
              href="tel:+8801712345678"
              className="flex items-center gap-1.5 hover:underline underline-offset-2 whitespace-nowrap shrink-0"
            >
              <Phone size={13} />
              <span>Hotline: 01712345678</span>
            </a>
            <span className="hidden sm:flex items-center gap-1.5 text-white/70">
              <Clock size={13} />
              <span>10AM - 10PM</span>
            </span>
          </div>

          <div className="flex items-center">
            {/* Compact on narrow phones so the top bar never overflows (body clips overflow-x). */}
            <a
              href="/my-orders"
              className="hidden sm:flex items-center gap-1.5 px-3 hover:underline underline-offset-2 whitespace-nowrap"
            >
              <Truck size={13} />
              <span>Track Order</span>
            </a>
            <span className="hidden sm:block h-3.5 w-px bg-white/20" aria-hidden="true" />
            <a href="/wishlist" className="px-3 hover:underline underline-offset-2 whitespace-nowrap">
              Wishlist
            </a>
            <span className="h-3.5 w-px bg-white/20" aria-hidden="true" />
            {isLoggedIn ? (
              <a href="/profile" className="px-3 hover:underline underline-offset-2 whitespace-nowrap truncate max-w-[160px]">
                Hi, {userName || "Account"}
              </a>
            ) : (
              <a href="/login" className="px-3 hover:underline underline-offset-2 whitespace-nowrap">
                Login / Register
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky block: main header + nav bar + mobile menu ─────────────── */}
      <div
        className={cn(
          "sticky top-0 z-50 bg-white transition-shadow duration-200",
          isScrolled && "shadow-gw-sm",
        )}
      >
        {/* ── Layer 2: Main Header ────────────────────────────────────────── */}
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="hidden lg:grid grid-cols-[220px_1fr_260px] gap-6 items-center py-4">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 shrink-0" aria-label="Gadget Wallet home">
              <img src="/logo.png" alt="Gadget Wallet" className="h-12 w-auto" />
            </a>

            {/* Search: [Category ▼][ input ][Search button] */}
            <form
              onSubmit={submitSearch}
              role="search"
              aria-label="Search products"
              className="flex h-12 rounded-md border border-gray-300 overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200"
            >
              <label className="sr-only" htmlFor="search-category">
                Category
              </label>
              <select
                id="search-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-40 border-r border-gray-200 px-3 text-sm outline-none bg-white text-gray-600 cursor-pointer"
              >
                <option value="">All Categories</option>
                {allCategories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="flex-1 px-4 text-sm outline-none text-gray-900 placeholder:text-gray-400 bg-white"
              />
              <button
                type="submit"
                aria-label="Search"
                className="w-14 bg-primary text-white hover:bg-primary-dark transition-colors duration-200 flex items-center justify-center"
              >
                <Search size={20} />
              </button>
            </form>

            {/* Right utility icons with labels */}
            <div className="flex items-center justify-end gap-5">
              {isLoggedIn ? (
                <div
                  className="relative"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <button
                    className="flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-primary transition-colors py-1"
                    aria-label="Account"
                  >
                    <User size={22} />
                    <span>Account</span>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full w-52 bg-white border border-gray-200 rounded-xl shadow-gw-lg overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userName || "My Account"}
                          </p>
                          <p className="text-xs text-gray-500">Welcome back</p>
                        </div>
                        <a
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                          <LayoutDashboard size={16} /> My Profile
                        </a>
                        <a
                          href="/my-orders"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                          <Package size={16} /> My Orders
                        </a>
                        <button
                          onClick={onLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors text-left border-t border-gray-200"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  href="/login"
                  className="flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-primary transition-colors py-1"
                  aria-label="Account"
                >
                  <User size={22} />
                  <span>Account</span>
                </a>
              )}

              <a
                href="/wishlist"
                className="relative flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-primary transition-colors py-1"
                aria-label="Wishlist"
              >
                <Heart size={22} />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </a>

              <a
                href="/cart"
                className="relative flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-primary transition-colors py-1"
                aria-label="Cart"
              >
                <ShoppingCart size={22} />
                <span>Cart</span>
                <motion.span
                  animate={badgeBounce ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm"
                >
                  {cartCount}
                </motion.span>
              </a>
            </div>
          </div>

          {/* Mobile: hamburger | logo | cart, then a search row */}
          <div className="lg:hidden flex items-center justify-between h-16 gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -ml-2 text-gray-600 hover:text-primary transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={26} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={26} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <a href="/" className="flex items-center justify-center" aria-label="Gadget Wallet home">
              <img src="/logo.png" alt="Gadget Wallet" className="h-9 w-auto" />
            </a>

            <a href="/cart" className="relative p-1 text-gray-600 hover:text-primary transition-colors" aria-label="Cart">
              <ShoppingCart size={24} />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            </a>
          </div>

          {/* Mobile search row */}
          <div className="lg:hidden pb-3">
            <form onSubmit={submitSearch} role="search" className="flex h-11 rounded-md border border-gray-300 overflow-hidden focus-within:border-primary transition-colors">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="flex-1 px-4 text-sm outline-none text-gray-900 placeholder:text-gray-400 bg-white"
              />
              <button
                type="submit"
                aria-label="Search"
                className="w-12 bg-primary text-white hover:bg-primary-dark transition-colors flex items-center justify-center"
              >
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* ── Layer 3: Navigation Bar ────────────────────────────────────── */}
        <nav className="hidden lg:block border-t border-gray-200 bg-white" aria-label="Main navigation">
          <div className="max-w-[1200px] mx-auto px-4 flex items-stretch">
            {/* Nav links — centered across the full nav bar */}
            <div className="flex-1 flex items-center justify-center gap-7">
              {navLinks.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 relative h-12 flex items-center",
                    isActive(link.href) ? "text-primary" : "text-gray-600 hover:text-primary",
                  )}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.a>
              ))}
            </div>
          </div>
        </nav>

        {/* ── Mobile menu drawer ──────────────────────────────────────────── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden bg-white border-t border-gray-200 shadow-gw-md overflow-hidden"
            >
              <div className="max-w-[1200px] mx-auto px-4">
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
                  }}
                  initial="hidden"
                  animate="visible"
                  className="py-4 space-y-1"
                >
                  {navLinks.map((link) => (
                    <motion.div
                      key={link.href}
                      variants={{ hidden: { opacity: 0, x: -15 }, visible: { opacity: 1, x: 0 } }}
                    >
                      <a
                        href={link.href}
                        className={cn(
                          "block py-2.5 text-sm font-medium transition-colors duration-200",
                          isActive(link.href) ? "text-primary" : "text-gray-600 hover:text-primary",
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </a>
                    </motion.div>
                  ))}

                  {/* Categories shortcut (mobile) */}
                  <motion.div variants={{ hidden: { opacity: 0, x: -15 }, visible: { opacity: 1, x: 0 } }}>
                    <a
                      href="/categories"
                      onClick={() => setIsOpen(false)}
                      className="block py-2.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                    >
                      All Categories
                    </a>
                  </motion.div>

                  {/* Account actions (mobile only) */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}
                    className="pt-3 mt-1 border-t border-gray-200"
                  >
                    {isLoggedIn ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 px-1 py-1.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                            {userName ? userName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <p className="text-sm font-semibold text-gray-900 truncate">{userName || "My Account"}</p>
                        </div>
                        <a
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="block py-2.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                        >
                          My Profile
                        </a>
                        <a
                          href="/my-orders"
                          onClick={() => setIsOpen(false)}
                          className="block py-2.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                        >
                          My Orders
                        </a>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onLogout?.();
                          }}
                          className="w-full text-left py-2.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-1">
                        <a
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="flex-1 text-center py-2.5 rounded-md bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
                        >
                          Sign In
                        </a>
                        <a
                          href="/register"
                          onClick={() => setIsOpen(false)}
                          className="flex-1 text-center py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-bold hover:border-primary hover:text-primary transition-colors"
                        >
                          Create Account
                        </a>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
