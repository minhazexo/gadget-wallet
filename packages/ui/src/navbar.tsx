import "./navbar.css";
import { cn } from "./utils";
import { Avatar } from "./avatar";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";

/**
 * Storefront header — 2-layer design:
 *
 *   1. MAIN HEADER  white — logo | [search pill] | labeled icons
 *   2. NAV BAR      white — centered nav links
 *
 * ALL styling lives in ./navbar.css under uniquely-prefixed `gw-nav-` classes
 * so they can never collide with classNames from other files. Framer Motion
 * still handles the hover/drawer/badge animations.
 *
 * Internal navigation uses react-router <Link>/useNavigate (client-side, no
 * full page reload); only external links use plain <a>.
 */

export interface HeaderCategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

interface NavbarProps {
  isLoggedIn?: boolean;
  cartCount?: number;
  wishlistCount?: number;
  userName?: string;
  /** Logged-in user's avatar URL — shown in place of the account icon. */
  userAvatar?: string | null;
  categories?: HeaderCategory[];
  onLogout?: () => void;
}

// Animated internal link (motion + react-router Link in one component).
const MotionLink = motion.create(Link);

export function Navbar({
  isLoggedIn = false,
  cartCount = 0,
  wishlistCount = 0,
  userName = "",
  userAvatar = null,
  onLogout,
}: NavbarProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [badgeBounce, setBadgeBounce] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Navigate to the search results page with the typed query.
  const submitSearch = (e?: FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    const q = query.trim();
    if (q) params.set("q", q);
    if (!q) return; // don't navigate on an empty search
    navigate(`/search${params.toString() ? `?${params.toString()}` : ""}`);
    setQuery("");
  };

  // The main header + nav row stick on scroll.
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

  const isActive = (to: string) => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname;
    if (to === "/") return path === "/";
    if (to === "/categories") return path === "/categories" || path.startsWith("/category/");
    return path.startsWith(to);
  };

  return (
    <header className="gw-nav">
      {/* ── Sticky block: main header + nav bar + mobile menu ─────────────── */}
      <div
        className={cn(
          "gw-nav-sticky",
          isScrolled && "gw-nav-scrolled",
        )}
      >
        {/* ── Main Header ────────────────────────────────────────────────── */}
        <div className="gw-nav-container">
          <div className="gw-nav-row">
            {/* Logo */}
            <Link to="/" className="gw-nav-logo" aria-label="Gadget Wallet home">
              <img src="/icons/Nav-footer.png" alt="Gadget Wallet" className="gw-nav-logo-img" />
            </Link>

            {/* Search pill */}
            <form
              onSubmit={submitSearch}
              role="search"
              aria-label="Search products"
              className="gw-nav-search"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="gw-nav-search-input"
              />
              <button type="submit" aria-label="Search" className="gw-nav-search-btn">
                <Search size={20} />
              </button>
            </form>

            {/* Right utility icons with labels */}
            <div className="gw-nav-actions">
              {isLoggedIn ? (
                <div
                  className="gw-nav-account"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <button
                    className="gw-nav-icon-btn"
                    aria-label="Account"
                  >
                    {userAvatar ? (
                      <Avatar
                        src={userAvatar}
                        name={userName}
                        alt="Account avatar"
                        className="gw-nav-avatar-xs"
                      />
                    ) : (
                      <User size={28} />
                    )}
                    <span>Account</span>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="gw-nav-menu"
                      >
                        <div className="gw-nav-menu-head">
                          <Avatar
                            src={userAvatar}
                            name={userName}
                            alt="Account avatar"
                            className="gw-nav-avatar-md"
                          />
                          <div className="gw-nav-menu-id">
                            <p className="gw-nav-menu-name">
                              {userName || "My Account"}
                            </p>
                            <p className="gw-nav-menu-sub">Welcome back</p>
                          </div>
                        </div>
                        <Link to="/profile" className="gw-nav-menu-item">
                          <LayoutDashboard size={16} /> My Profile
                        </Link>
                        <Link to="/my-orders" className="gw-nav-menu-item">
                          <Package size={16} /> My Orders
                        </Link>
                        <button
                          onClick={onLogout}
                          className="gw-nav-menu-item gw-nav-menu-item--logout"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="gw-nav-icon-btn" aria-label="Account">
                  <User size={28} />
                  <span>Account</span>
                </Link>
              )}

              <Link
                to="/wishlist"
                className="gw-nav-icon-btn"
                aria-label="Wishlist"
              >
                <Heart size={28} />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="gw-nav-badge">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="gw-nav-icon-btn"
                aria-label="Cart"
              >
                <ShoppingCart size={28} />
                <span>Cart</span>
                <motion.span
                  animate={badgeBounce ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="gw-nav-badge"
                >
                  {cartCount}
                </motion.span>
              </Link>
            </div>
          </div>

          {/* Mobile: hamburger | logo | cart, then a search row */}
          <div className="gw-nav-mrow">              <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="gw-nav-burger"
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
                    <X size={32} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={32} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <Link to="/" className="gw-nav-mlogo" aria-label="Gadget Wallet home">
              <img src="/icons/Nav-footer.png" alt="Gadget Wallet" className="gw-nav-mlogo-img" />
            </Link>

            <Link to="/cart" className="gw-nav-mcart" aria-label="Cart">
              <ShoppingCart size={30} />
              <span className="gw-nav-badge">
                {cartCount}
              </span>
            </Link>
          </div>

          {/* Mobile search row */}
          <div className="gw-nav-msearch">
            <form onSubmit={submitSearch} role="search" className="gw-nav-msearch-form">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="gw-nav-search-input"
              />
              <button
                type="submit"
                aria-label="Search"
                className="gw-nav-search-btn"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* ── Navigation Bar ─────────────────────────────────────────────── */}
        <nav className="gw-nav-bar" aria-label="Main navigation">
          <div className="gw-nav-container gw-nav-bar-inner">
            {/* Nav links — centered across the full nav bar */}
            <div className="gw-nav-links">
              {navLinks.map((link) => (
                <MotionLink
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "gw-nav-link",
                    isActive(link.to) && "gw-nav-link--active",
                  )}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <motion.div
                      layoutId="nav-underline"
                      className="gw-nav-underline"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </MotionLink>
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
              className="gw-nav-drawer"
            >
              <div className="gw-nav-container">
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
                  }}
                  initial="hidden"
                  animate="visible"
                  className="gw-nav-drawer-body"
                >
                  {navLinks.map((link) => (
                    <motion.div
                      key={link.to}
                      variants={{ hidden: { opacity: 0, x: -15 }, visible: { opacity: 1, x: 0 } }}
                    >
                      <Link
                        to={link.to}
                        className={cn(
                          "gw-nav-drawer-link",
                          isActive(link.to) && "gw-nav-drawer-link--active",
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Categories shortcut (mobile) */}
                  <motion.div variants={{ hidden: { opacity: 0, x: -15 }, visible: { opacity: 1, x: 0 } }}>
                    <Link
                      to="/categories"
                      onClick={() => setIsOpen(false)}
                      className="gw-nav-drawer-link"
                    >
                      All Categories
                    </Link>
                  </motion.div>

                  {/* Account actions (mobile only) */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}
                    className="gw-nav-drawer-section"
                  >
                    {isLoggedIn ? (
                      <div className="gw-nav-stack">
                        <div className="gw-nav-drawer-user">
                          <Avatar
                            src={userAvatar}
                            name={userName}
                            alt="Account avatar"
                            className="gw-nav-avatar-sm"
                          />
                          <p className="gw-nav-menu-name">{userName || "My Account"}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setIsOpen(false)}
                          className="gw-nav-drawer-link"
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/my-orders"
                          onClick={() => setIsOpen(false)}
                          className="gw-nav-drawer-link"
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onLogout?.();
                          }}
                          className="gw-nav-drawer-link gw-nav-drawer-link--danger"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <div className="gw-nav-drawer-actions">
                        <Link
                          to="/login"
                          onClick={() => setIsOpen(false)}
                          className="gw-nav-auth-btn"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsOpen(false)}
                          className="gw-nav-auth-btn gw-nav-auth-btn--ghost"
                        >
                          Create Account
                        </Link>
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
