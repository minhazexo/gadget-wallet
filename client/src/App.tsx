import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar, Footer, ScrollToTop, type HeaderCategory } from "@gadget-wallet/ui";
import { lazy, Suspense, useEffect, useState } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { useCartStore } from "./store/useCartStore";
import { useWishlistStore } from "./store/useWishlistStore";
import { PageTransition } from "./components/PageTransition";
import { ToastProvider } from "./components/ToastProvider";
import { MobileTabBar } from "./components/MobileTabBar";
import { cachedGet } from "./lib/cachedGet";

// ── Route-level code splitting ─────────────────────────────────────────────
// Every page is a lazy chunk: a storefront visitor never downloads admin,
// checkout, profile or static-page code. The admin barrel (pages/admin/index)
// loads the whole dashboard as ONE chunk on first admin visit.
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Categories = lazy(() => import("./pages/Categories"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Profile = lazy(() => import("./pages/Profile"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./pages/admin").then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin").then((m) => ({ default: m.Dashboard })));
const AdminProducts = lazy(() => import("./pages/admin").then((m) => ({ default: m.AdminProducts })));
const AdminProductForm = lazy(() => import("./pages/admin").then((m) => ({ default: m.AdminProductForm })));
const AdminProductDetail = lazy(() => import("./pages/admin").then((m) => ({ default: m.AdminProductDetail })));
const AdminOrders = lazy(() => import("./pages/admin").then((m) => ({ default: m.AdminOrders })));
const AdminCategories = lazy(() => import("./pages/admin").then((m) => ({ default: m.AdminCategories })));
const AdminBrands = lazy(() => import("./pages/admin").then((m) => ({ default: m.AdminBrands })));

/** Shown while a route chunk loads — mirrors the old route look without blanking. */
function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-gw-gray-500">Loading…</div>
    </div>
  );
}

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const location = useLocation();
  const [categories, setCategories] = useState<HeaderCategory[]>([]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Load cart + wishlist once auth state is known
  useEffect(() => {
    if (useAuthStore.getState().isLoading) return;
    useCartStore.getState().load();
    useWishlistStore.getState().load();
  }, [user]);

  // Scroll to top on route change — instant, so page changes feel snappy on
  // mobile (smooth scrolling a long page on every navigation feels sluggish).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  // Live categories for the header's mega menu / category dropdown.
  // Shared via cachedGet so the header + Home + Categories page reuse one
  // request instead of each fetching /categories separately.
  useEffect(() => {
    cachedGet<{ data: HeaderCategory[] }>("/categories", 5 * 60_000)
      .then((body) => setCategories(body?.data || []))
      .catch(() => {});
  }, []);

  const cartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="min-h-screen bg-gw-bg text-gw-black dark:text-gray-100 flex flex-col">
      <Navbar
        isLoggedIn={!!user}
        cartCount={cartCount}
        wishlistCount={wishlistItems.length}
        userName={user?.name}
        userAvatar={user?.avatar}
        categories={categories}
        onLogout={() => {
          logout();
          useCartStore.getState().clearCart();
        }}
      />
      <ToastProvider />
      <ScrollToTop />
      {/* pb-16 reserves room for the mobile tab bar; hidden on checkout flow. */}
      <main className="flex-1 pt-0 pb-16 lg:pb-0">
        {/* No AnimatePresence mode="wait": the old exit animation blocked the
            route swap for ~300ms. Pages now mount immediately with a light
            fade-in; lazy chunks show RouteFallback while they load. */}
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/product/:slug" element={<PageTransition><ProductDetails /></PageTransition>} />
            <Route path="/categories" element={<PageTransition><Categories /></PageTransition>} />
            <Route path="/category/:slug" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/search" element={<PageTransition><SearchResults /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
            <Route path="/order-success/:id" element={<PageTransition><OrderSuccess /></PageTransition>} />
            <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
            <Route path="/my-orders" element={<PageTransition><MyOrders /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<PageTransition><AdminDashboard /></PageTransition>} />
              <Route path="products" element={<PageTransition><AdminProducts /></PageTransition>} />
              <Route path="products/new" element={<PageTransition><AdminProductForm /></PageTransition>} />
              <Route path="products/:id" element={<PageTransition><AdminProductDetail /></PageTransition>} />
              <Route path="products/:id/edit" element={<PageTransition><AdminProductForm /></PageTransition>} />
              <Route path="categories" element={<PageTransition><AdminCategories /></PageTransition>} />
              <Route path="brands" element={<PageTransition><AdminBrands /></PageTransition>} />
              <Route path="orders" element={<PageTransition><AdminOrders /></PageTransition>} />
            </Route>
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      {/* Tab bar hidden on checkout/order-success (focus flow) and on product
          pages — the sticky Add to Cart / Buy Now bar replaces it there. */}
      {!location.pathname.startsWith("/checkout") &&
        !location.pathname.startsWith("/order-success") &&
        !location.pathname.startsWith("/product/") && (
          <MobileTabBar cartCount={cartCount} wishlistCount={wishlistItems.length} />
        )}
    </div>
  );
}
