import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar, Footer, ScrollToTop, type HeaderCategory } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import api from "./lib/api";
import { useAuthStore } from "./store/useAuthStore";
import { useCartStore } from "./store/useCartStore";
import { useWishlistStore } from "./store/useWishlistStore";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/PageTransition";
import { ToastProvider } from "./components/ToastProvider";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import SearchResults from "./pages/SearchResults";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminProductDetail from "./pages/admin/AdminProductDetail";
import AdminOrders from "./pages/admin/AdminOrders";

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

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Live categories for the header's mega menu / category dropdown.
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data?.data || []))
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
      <main className="flex-1 pt-0">
        <AnimatePresence mode="wait">
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
              <Route path="orders" element={<PageTransition><AdminOrders /></PageTransition>} />
            </Route>
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
