import { cn } from "./utils";
import { Container } from "./container";
import { useEffect, useState } from "react";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 136);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string) => {
    if (typeof window === "undefined") return false;
    if (href === "/") return window.location.pathname === "/";
    return window.location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-gw-red h-9 flex items-center justify-center text-white text-[13px] font-medium px-4 text-center">
        <span className="truncate">Free Shipping on orders over $100 | Official Warranty on all products</span>
      </div>
      <div className={cn("bg-white transition-shadow duration-200", isScrolled && "shadow-gw-sm")}>
        <Container>
          <div className="flex items-center h-[100px] gap-6">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gw-gray-500 hover:text-gw-red transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <a href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="Gadget Wallet" className="h-[64px] w-auto" />
            </a>

            <div className="hidden lg:flex items-center flex-1 max-w-[600px] mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gw-gray-300 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full h-[52px] pl-14 pr-28 bg-white border border-gw-border rounded-full text-gw-black placeholder:text-gw-gray-300 focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red transition-all duration-200"
                />
                <button className="absolute right-1.5 top-1/2 -translate-y-1/2 h-11 px-6 bg-gw-red text-white text-sm font-bold rounded-full hover:bg-gw-red-hover transition-all duration-200">
                  Search
                </button>
              </div>
            </div>

            <div className="flex items-center gap-0 ml-auto">
              <a href="/login" className="p-3 text-gw-gray-500 hover:text-gw-red transition-colors" aria-label="Account">
                <User className="w-8 h-8" />
              </a>
              <a href="/wishlist" className="p-3 text-gw-gray-500 hover:text-gw-red transition-colors" aria-label="Wishlist">
                <Heart className="w-8 h-8" />
              </a>
              <a href="/cart" className="p-3 text-gw-gray-500 hover:text-gw-red transition-colors relative" aria-label="Cart">
                <ShoppingCart className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 w-[26px] h-[26px] rounded-full bg-gw-red text-white text-[14px] font-bold flex items-center justify-center shadow-sm">
                  0
                </span>
              </a>
            </div>
          </div>
        </Container>

        <div className="hidden lg:block border-t border-gw-border">
          <Container>
            <div className="flex items-center justify-center gap-8 h-11">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 relative",
                    isActive(link.href)
                      ? "text-gw-red after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gw-red after:rounded-full"
                      : "text-gw-gray-500 hover:text-gw-red"
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Container>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gw-border shadow-gw-md">
          <Container>
            <div className="py-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gw-gray-300 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-11 pl-10 pr-4 bg-white border border-gw-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gw-red/20 transition-all"
                />
              </div>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block py-2.5 text-sm font-medium transition-colors duration-200",
                    isActive(link.href) ? "text-gw-red" : "text-gw-gray-500 hover:text-gw-red"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
