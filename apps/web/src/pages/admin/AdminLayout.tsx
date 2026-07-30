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
    <div className="min-h-screen flex pt-[112px]">
      <aside className="w-64 border-r border-gw-border min-h-[calc(100vh-112px)] p-4 hidden lg:flex flex-col bg-white">
        <h2 className="font-bold text-lg text-gw-black mb-6 px-3">Admin Panel</h2>
        <nav className="space-y-1 flex-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gw-red/10 text-gw-red"
                    : "text-gw-gray-500 hover:text-gw-black hover:bg-gw-bg"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="pt-6 border-t border-gw-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gw-gray-500 hover:text-gw-red transition-colors rounded-xl hover:bg-gw-bg"
          >
            <LogOut className="w-5 h-5" />
            Back to Store
          </Link>
        </div>
      </aside>
      <div className="flex-1 bg-gw-bg">
        <Outlet />
      </div>
    </div>
  );
}
