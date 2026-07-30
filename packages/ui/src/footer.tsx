import { Container } from "./container";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  quick: {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Categories", href: "/categories" },
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  service: {
    title: "Customer Service",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & Returns", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-gw-footer text-slate-300">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 py-10 md:py-16">
          <div>
            <a href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Gadget Wallet" className="h-16 w-auto brightness-0 invert" />
            </a>
            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              Your trusted destination for premium electronics. We bring you the latest gadgets at the best prices with official warranty.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-gw-red" />
                <span>San Francisco, CA 94102</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-gw-red" />
                <span>support@gadgetwallet.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-gw-red" />
                <span>+1 (555) 000-0000</span>
              </div>
            </div>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Follow Us</h3>
            <p className="text-sm text-slate-400 mb-4">Stay connected for exclusive deals and updates.</p>
            <div className="flex gap-3">
              {["Facebook", "Twitter", "Instagram", "YouTube"].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-300 hover:bg-gw-red hover:text-white transition-all"
                >
                  {name[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>&copy; 2024 Gadget Wallet. All rights reserved.</p>
          <p>Premium Electronics Store</p>
        </div>
      </Container>
    </footer>
  );
}
