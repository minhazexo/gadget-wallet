import { cn } from "./utils";
import { Container } from "./container";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, Heart, Search, User } from "lucide-react";
import { useState } from "react";

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

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 20);
    });
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-gw-bg/90 backdrop-blur-xl border-b border-white/10 shadow-lg"
          : "bg-transparent",
      )}
    >
      <Container>
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Gadget Wallet" className="w-8 h-8 object-contain" />
            <span className="font-display text-xl font-bold text-white">
              Gadget<span className="text-gw-accent">Wallet</span>
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gw-text-secondary hover:text-gw-text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-gw-text-secondary hover:text-gw-text-primary transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gw-text-secondary hover:text-gw-text-primary transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 text-gw-text-secondary hover:text-gw-text-primary transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gw-accent text-gw-bg text-xs font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </button>
            <button className="p-2 text-gw-text-secondary hover:text-gw-text-primary transition-colors">
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gw-text-secondary hover:text-gw-text-primary"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-gw-bg/95 backdrop-blur-xl"
          >
            <Container>
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block py-2 text-gw-text-secondary hover:text-gw-text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
