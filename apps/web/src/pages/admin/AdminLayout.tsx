import { Container } from "@gadget-wallet/ui";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="pt-20 min-h-screen flex">
      <aside className="w-64 border-r border-white/10 min-h-screen p-4 hidden lg:block">
        <h2 className="font-display font-bold text-lg mb-6 px-3">Admin Panel</h2>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-gw-accent/10 text-gw-accent" : "text-gw-text-secondary hover:text-gw-text-primary hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10 mt-6">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gw-text-secondary hover:text-gw-text-primary transition-colors">
            <LogOut className="w-5 h-5" />
            Back to Store
          </Link>
        </div>
      </aside>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
