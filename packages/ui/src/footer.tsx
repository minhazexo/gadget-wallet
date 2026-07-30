import { Container } from "./container";
import { Mail, Phone, MapPin, Github, Twitter, Youtube } from "lucide-react";

const footerLinks = {
  shop: {
    title: "Shop",
    links: [
      { label: "Smartphones", href: "/category/smartphones" },
      { label: "Laptops", href: "/category/laptops" },
      { label: "Smartwatches", href: "/category/smartwatches" },
      { label: "Headphones", href: "/category/headphones" },
      { label: "Gaming", href: "/category/gaming" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & Returns", href: "/shipping" },
      { label: "Warranty", href: "/warranty" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-gw-surface/50 border-t border-white/10 mt-20">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Gadget Wallet" className="w-8 h-8 object-contain" />
              <span className="font-display text-xl font-bold text-white">
                Gadget<span className="text-gw-accent">Wallet</span>
              </span>
            </a>
            <p className="text-gw-text-secondary text-sm mb-6 max-w-sm">
              Your premium destination for the latest electronics and gadgets. 
              Experience the future of technology with our curated collection.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gw-text-secondary text-sm">
                <MapPin className="w-4 h-4 text-gw-accent" />
                <span>San Francisco, CA 94102</span>
              </div>
              <div className="flex items-center gap-2 text-gw-text-secondary text-sm">
                <Mail className="w-4 h-4 text-gw-accent" />
                <span>support@gadgetwallet.com</span>
              </div>
              <div className="flex items-center gap-2 text-gw-text-secondary text-sm">
                <Phone className="w-4 h-4 text-gw-accent" />
                <span>+1 (555) 000-0000</span>
              </div>
            </div>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gw-text-secondary hover:text-gw-accent transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gw-text-secondary">
            &copy; 2024 Gadget Wallet. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 text-gw-text-secondary hover:text-gw-accent transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 text-gw-text-secondary hover:text-gw-accent transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 text-gw-text-secondary hover:text-gw-accent transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
