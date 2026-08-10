import { LayoutDashboard, Package, ShoppingCart, FolderOpen, LogOut, Menu, X } from "lucide-react";
import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/useAuthStore";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderOpen },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
];

export default function AdminLayout() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Auth state is restored asynchronously (checkAuth → GET /auth/me). Until it
  // resolves we must render neither the admin shell nor <Outlet/>: the child
  // pages fire /api/admin/* requests on mount, so a non-admin visiting /admin
  // would briefly trigger admin calls and see the dashboard chrome flash
  // before the redirect below kicks in.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gw-gray-500 animate-pulse">
        Loading…
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    // Not signed in → login; signed in but not an admin → back to the store.
    return <Navigate to={user ? "/" : "/login"} replace />;
  }

  const isActive = (href: string) => location.pathname === href;

  return (
    <section className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="w-64 border-r border-gw-border min-h-screen p-5 hidden lg:flex lg:flex-col bg-white">
        <div className="flex items-center gap-2 mb-8 px-2">
          <img src="/logo.png" alt="" className="h-8 w-auto" />
        </div>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-gw-red/10 text-gw-red" : "text-gw-gray-500 hover:text-gw-black hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6 border-t border-gw-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gw-gray-500 hover:text-gw-black transition-colors rounded-xl"
          >
            <LogOut className="w-5 h-5" />
            Back to Store
          </Link>
        </div>
      </aside>

      <div className="flex-1 bg-gw-bg min-w-0">
        {/* Mobile top bar + menu (sidebar is hidden below lg) */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gw-border shadow-gw-sm">
          <div className="flex items-center justify-between px-4 h-14">
            <Link to="/admin" className="flex items-center gap-2">
              <img src="/logo.png" alt="Gadget Wallet Admin" className="h-8 w-auto" />
              <span className="text-xs font-bold uppercase tracking-wider text-gw-gray-500 hidden sm:inline">
                Admin
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 text-gw-gray-500 hover:text-gw-red transition-colors"
              aria-label="Toggle admin menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden border-t border-gw-border"
              >
                <div className="px-3 py-2 space-y-1">
                  {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                          active ? "bg-gw-red/10 text-gw-red" : "text-gw-gray-500 hover:text-gw-black hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gw-gray-500 hover:text-gw-black hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Back to Store
                  </Link>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        <Outlet />
      </div>
    </section>
  );
}
