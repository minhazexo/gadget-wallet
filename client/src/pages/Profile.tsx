import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Heart, MapPin, CreditCard,
  Shield, Bell, Star, History, Headphones, Sun, Moon, LogOut,
} from "lucide-react";
import { Container, Avatar } from "@gadget-wallet/ui";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import api from "../lib/api";
import { showToast } from "../store/useToastStore";
import { OverviewSection } from "./profile/OverviewSection";
import { OrdersSection } from "./profile/OrdersSection";
import { CartSection } from "./profile/CartSection";
import { WishlistSection } from "./profile/WishlistSection";
import { AddressesSection } from "./profile/AddressesSection";
import { PaymentsSection } from "./profile/PaymentsSection";
import { SecuritySection } from "./profile/SecuritySection";
import { NotificationsSection } from "./profile/NotificationsSection";
import { ReviewsSection } from "./profile/ReviewsSection";
import { RecentlyViewedSection } from "./profile/RecentlyViewedSection";
import { SupportSection } from "./profile/SupportSection";
import { cn } from "@gadget-wallet/ui";

type TabKey =
  | "overview" | "orders" | "cart" | "wishlist" | "addresses" | "payments"
  | "security" | "notifications" | "reviews" | "recently-viewed" | "support";

const tabs: { key: TabKey; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "orders", label: "My Orders", icon: Package },
  { key: "cart", label: "Cart", icon: ShoppingCart },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "payments", label: "Payment Methods", icon: CreditCard },
  { key: "security", label: "Security", icon: Shield },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "recently-viewed", label: "Recently Viewed", icon: History },
  { key: "support", label: "Support", icon: Headphones },
];

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<TabKey>("overview");
  const [dark, setDark] = useState(() => localStorage.getItem("gw-dark") === "1");
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, reviews: 0 });
  const [defaultAddress, setDefaultAddress] = useState<any>(null);

  useEffect(() => {
    const t = searchParams.get("tab") as TabKey | null;
    if (t && tabs.some((x) => x.key === t)) setTab(t);
  }, [searchParams]);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("gw-dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    if (!user || isLoading) return;
    api
      .get("/profile")
      .then((res) => {
        setStats(res.data.data?.stats || { orders: 0, wishlist: 0, reviews: 0 });
        setDefaultAddress(res.data.data?.defaultAddress || null);
      })
      .catch(() => {});
  }, [user, isLoading]);

  if (!isLoading && !user) {
    return (
      <Container>
        <div className="py-32 text-center">
          <p className="text-gw-gray-500 mb-4">Please sign in to view your account dashboard.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-gw-red text-white text-sm font-bold rounded-btn hover:bg-gw-red-hover transition-colors"
          >
            Sign In
          </button>
        </div>
      </Container>
    );
  }

  const handleLogout = () => {
    logout();
    useCartStore.getState().clearCart();
    showToast("Logged out successfully", "info");
    navigate("/");
  };

  const renderSection = () => {
    switch (tab) {
      case "overview":
        return <OverviewSection stats={stats} defaultAddress={defaultAddress} onNavigate={(t) => setTab(t as TabKey)} />;
      case "orders":
        return <OrdersSection />;
      case "cart":
        return <CartSection />;
      case "wishlist":
        return <WishlistSection />;
      case "addresses":
        return <AddressesSection />;
      case "payments":
        return <PaymentsSection />;
      case "security":
        return <SecuritySection />;
      case "notifications":
        return <NotificationsSection />;
      case "reviews":
        return <ReviewsSection />;
      case "recently-viewed":
        return <RecentlyViewedSection />;
      case "support":
        return <SupportSection />;
      default:
        return <OverviewSection stats={stats} defaultAddress={defaultAddress} onNavigate={(t) => setTab(t as TabKey)} />;
    }
  };

  return (
    <section className="gw-section">
      <Container>
        <div className="mb-6 md:mb-8">
          <h1 className="gw-title">My Account</h1>
          <p className="gw-muted text-sm mt-1">
            Manage your profile, orders, wishlist and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 md:gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[148px] lg:self-start">
            {/* User card */}
            <div className="gw-panel-category p-5 mb-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={user?.avatar}
                  name={user?.name}
                  alt={user?.name}
                  className="w-12 h-12 text-lg"
                />
                <div className="min-w-0">
                  <p className="font-bold text-gw-black dark:text-white truncate">{user?.name}</p>
                  <p className="gw-muted-xs truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setDark(!dark)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gw-border dark:border-gray-700 text-xs font-medium gw-muted hover:text-gw-red transition-colors"
                >
                  {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  {dark ? "Light" : "Dark"}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gw-red/30 text-xs font-medium text-gw-red hover:bg-gw-red hover:text-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            </div>

            {/* Nav */}
            <nav className="gw-panel-category p-2">
              <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0" style={{ scrollbarWidth: "none" }}>
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                      tab === t.key
                        ? "bg-gw-red text-white"
                        : "gw-muted hover:text-gw-red hover:bg-gw-bg dark:hover:bg-gray-800",
                    )}
                  >
                    <t.icon className="w-4 h-4 shrink-0" />
                    <span className="lg:inline">{t.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </aside>

          {/* Content */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="min-w-0"
          >
            {renderSection()}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
