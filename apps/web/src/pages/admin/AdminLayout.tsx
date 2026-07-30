import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <section className="flex min-h-screen">
      <aside className="w-64 border-r border-gw-border min-h-screen p-5 hidden lg:block bg-white">
        <div className="flex items-center gap-2 mb-8 px-2">
          <img src="/logo.png" alt="" className="h-8 w-auto" />
        </div>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "bg-gw-red/10 text-gw-red" : "text-gw-gray-500 hover:text-gw-black hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6 border-t border-gw-border mt-6">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gw-gray-500 hover:text-gw-black transition-colors rounded-xl">
            <LogOut className="w-5 h-5" />
            Back to Store
          </Link>
        </div>
      </aside>
      <div className="flex-1 bg-gw-bg">
        <Outlet />
      </div>
    </section>
  );
}
