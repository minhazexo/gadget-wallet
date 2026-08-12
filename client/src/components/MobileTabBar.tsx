import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";
import { cn } from "@gadget-wallet/ui";

/**
 * Native-app style bottom navigation — mobile only (hidden ≥ lg, where the
 * full navbar lives). 5 equal 44px+ tabs with badges on Cart/Wishlist.
 * The bar is hidden on checkout/order-success so the focus stays on the
 * payment flow (App decides that; this component only renders the bar).
 */

interface MobileTabBarProps {
  cartCount?: number;
  wishlistCount?: number;
}

const tabs = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/shop", label: "Shop", icon: Search, end: false },
  { to: "/cart", label: "Cart", icon: ShoppingCart, end: false },
  { to: "/wishlist", label: "Wishlist", icon: Heart, end: false },
  { to: "/profile", label: "Account", icon: User, end: false },
];

export function MobileTabBar({ cartCount = 0, wishlistCount = 0 }: MobileTabBarProps) {
  const { pathname } = useLocation();
  const badgeFor = (to: string) =>
    to === "/cart" ? cartCount : to === "/wishlist" ? wishlistCount : 0;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden bg-white border-t border-gw-border pb-safe"
    >
      <div className="flex items-stretch h-16">
        {tabs.map((tab) => {
          const badge = badgeFor(tab.to);
          const isActive =
            tab.end ? pathname === tab.to : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-1 min-w-0",
                "text-[10px] font-semibold transition-colors",
                isActive ? "text-gw-red" : "text-gw-gray-400 hover:text-gw-gray-600",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {({ isActive: navActive }) => (
                <>
                  <span className="relative">
                    <tab.icon className="w-6 h-6" strokeWidth={navActive ? 2.4 : 2} />
                    {badge > 0 && (
                      <motion.span
                        key={badge}
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        className="absolute -top-2 -right-2.5 h-4 min-w-4 px-1 rounded-full bg-gw-red text-white text-[10px] font-bold flex items-center justify-center"
                      >
                        {badge > 99 ? "99+" : badge}
                      </motion.span>
                    )}
                  </span>
                  <span className="leading-none">{tab.label}</span>
                  {/* Active indicator dot */}
                  <span
                    className={cn(
                      "absolute top-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-b-full transition-opacity",
                      navActive ? "bg-gw-red opacity-100" : "opacity-0",
                    )}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
