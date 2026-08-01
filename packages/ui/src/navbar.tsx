import { cn } from "./utils";
import { Container } from "./container";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

interface NavbarProps {
  isLoggedIn?: boolean;
  cartCount?: number;
  userName?: string;
  onLogout?: () => void;
}

export function Navbar({ isLoggedIn = false, cartCount = 0, userName = "", onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [badgeBounce, setBadgeBounce] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 136);
    window.addEventListener("scroll", handler);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, []);

  const isActive = (href: string) => {
    if (typeof window === "undefined") return false;
    if (href === "/") return window.location.pathname === "/";
    return window.location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement Bar */}
      <motion.div
        initial={{ y: -36 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gw-red h-9 flex items-center justify-center text-white text-[13px] font-medium px-4 text-center overflow-hidden"
      >
        <span className="truncate">
          Free Shipping on orders over $100 | Official Warranty on all products
        </span>
      </motion.div>

      {/* Main Header */}
      <motion.div
        initial={{ y: 0 }}
        className={cn("bg-white transition-shadow duration-200", isScrolled && "shadow-gw-sm")}
      >
        <Container>
          <div className="flex items-center h-[72px] md:h-[100px] gap-4 md:gap-6">
            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gw-gray-500 hover:text-gw-red transition-colors"
              aria-label="Toggle menu"
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
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-2 shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img src="/logo.png" alt="Gadget Wallet" className="h-10 md:h-[64px] w-auto" />
            </motion.a>

            {/* Desktop Search */}
            <div className="hidden lg:flex items-center flex-1 max-w-[600px] mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gw-gray-300 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full h-[52px] pl-14 pr-28 bg-white border border-gw-border rounded-full text-gw-black placeholder:text-gw-gray-300 focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red transition-all duration-200"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-11 px-6 bg-gw-red text-white text-sm font-bold rounded-full hover:bg-gw-red-hover transition-all duration-200"
                >
                  Search
                </motion.button>
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-0 ml-auto">
              {isLoggedIn ? (
                <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                  <motion.a
                    href="/profile"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 md:p-3 text-gw-gray-500 hover:text-gw-red transition-colors"
                    aria-label="Account"
                  >
                    <User className="w-6 h-6 md:w-8 md:h-8" />
                  </motion.a>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full w-52 bg-white border border-gw-border rounded-xl shadow-gw-lg overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gw-border">
                          <p className="text-sm font-semibold text-gw-black truncate">{userName || "My Account"}</p>
                          <p className="text-xs text-gw-gray-500">Welcome back</p>
                        </div>
                        <a
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gw-gray-700 hover:bg-gw-bg hover:text-gw-red transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> My Profile
                        </a>
                        <a
                          href="/my-orders"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gw-gray-700 hover:bg-gw-bg hover:text-gw-red transition-colors"
                        >
                          <Package className="w-4 h-4" /> My Orders
                        </a>
                        <button
                          onClick={onLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gw-gray-700 hover:bg-gw-bg hover:text-gw-red transition-colors text-left border-t border-gw-border"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.a
                  href="/login"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 md:p-3 text-gw-gray-500 hover:text-gw-red transition-colors"
                  aria-label="Account"
                >
                  <User className="w-6 h-6 md:w-8 md:h-8" />
                </motion.a>
              )}
              <motion.a
                href="/wishlist"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 md:p-3 text-gw-gray-500 hover:text-gw-red transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-6 h-6 md:w-8 md:h-8" />
              </motion.a>
              <motion.a
                href="/cart"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 md:p-3 text-gw-gray-500 hover:text-gw-red transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
                <motion.span
                  animate={badgeBounce ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute -top-1 -right-1 w-[22px] h-[22px] md:w-[26px] md:h-[26px] rounded-full bg-gw-red text-white text-[11px] md:text-[14px] font-bold flex items-center justify-center shadow-sm"
                >
                  {cartCount}
                </motion.span>
              </motion.a>
            </div>
          </div>
        </Container>

        {/* Desktop Nav Links */}
        <div className="hidden lg:block border-t border-gw-border">
          <Container>
            <div className="flex items-center justify-center gap-8 h-11">
              {navLinks.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 relative",
                    isActive(link.href)
                      ? "text-gw-red"
                      : "text-gw-gray-500 hover:text-gw-red"
                  )}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-gw-red rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.a>
              ))}
            </div>
          </Container>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden bg-white border-t border-gw-border shadow-gw-md overflow-hidden"
          >
            <Container>
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
                }}
                initial="hidden"
                animate="visible"
                className="py-4 space-y-3"
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="relative"
                >
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gw-gray-300 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full h-11 pl-10 pr-4 bg-white border border-gw-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gw-red/20 transition-all"
                  />
                </motion.div>
                {navLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, x: -15 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <a
                      href={link.href}
                      className={cn(
                        "block py-2.5 text-sm font-medium transition-colors duration-200",
                        isActive(link.href) ? "text-gw-red" : "text-gw-gray-500 hover:text-gw-red"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </a>
                  </motion.div>
                ))}
              </motion.div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
