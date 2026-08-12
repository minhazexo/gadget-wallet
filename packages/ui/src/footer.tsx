import { Container } from "./container";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  quick: {
    title: "Quick Links",
    links: [
      { label: "Home", to: "/" },
      { label: "Shop", to: "/shop" },
      { label: "Categories", to: "/categories" },
      { label: "About Us", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  service: {
    title: "Customer Service",
    links: [
      { label: "FAQ", to: "/faq" },
      { label: "Shipping & Returns", to: "/faq" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
    ],
  },
};

// Animated internal link (motion + react-router Link in one component).
const MotionLink = motion.create(Link);

const staggerColumn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function Footer() {
  return (
    <footer className="bg-gw-footer text-slate-300">
      <Container>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 py-10 md:py-16"
        >
          {/* Brand Column */}
          <motion.div variants={fadeSlideUp}>
            <MotionLink
              to="/"
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img src="/icons/Nav-footer.png" alt="Gadget Wallet" className="h-24 w-auto" />
            </MotionLink>
            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              Your trusted destination for premium electronics. We bring you the latest gadgets at the best prices with official warranty.
            </p>
            <motion.div
              variants={staggerColumn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-2"
            >
              {[
                { icon: MapPin, text: "San Francisco, CA 94102" },
                { icon: Mail, text: "support@gadgetwallet.com" },
                { icon: Phone, text: "+1 (555) 000-0000" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeSlideUp}
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-2 text-sm text-slate-400 transition-all"
                >
                  <item.icon className="w-4 h-4 text-gw-red shrink-0" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Links Columns */}
          {Object.values(footerLinks).map((section) => (
            <motion.div key={section.title} variants={fadeSlideUp}>
              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">{section.title}</h3>
              <motion.ul
                variants={staggerColumn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-3"
              >
                {section.links.map((link) => (
                  <motion.li key={link.label} variants={fadeSlideUp}>
                    <MotionLink
                      to={link.to}
                      whileHover={{ x: 4 }}
                      className="text-sm text-slate-400 hover:text-white transition-colors inline-block"
                    >
                      {link.label}
                    </MotionLink>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ))}

          {/* Social Column */}
          <motion.div variants={fadeSlideUp}>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Follow Us</h3>
            <p className="text-sm text-slate-400 mb-4">Stay connected for exclusive deals and updates.</p>
            <motion.div
              variants={staggerColumn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex gap-3"
            >
              {["Facebook", "Twitter", "Instagram", "YouTube"].map((name) => (
                <motion.a
                  key={name}
                  href="#"
                  variants={fadeSlideUp}
                  whileHover={{ scale: 1.15, backgroundColor: "#e11d2e", color: "#ffffff" }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-300 hover:bg-gw-red hover:text-white transition-all"
                >
                  {name[0]}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="border-t border-white/10 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500"
        >
          <p>&copy; 2024 Gadget Wallet. All rights reserved.</p>
          <p>Premium Electronics Store</p>
        </motion.div>
      </Container>
    </footer>
  );
}
