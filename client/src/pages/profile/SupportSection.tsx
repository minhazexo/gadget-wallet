import { motion } from "framer-motion";
import { Headphones, MessageCircle, HelpCircle, RotateCcw, Mail, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../store/useToastStore";
import { SectionHeader } from "./shared";
import { cn } from "@gadget-wallet/ui";

export function SupportSection() {
  const navigate = useNavigate();

  const openLiveChat = () => {
    showToast("Live chat is available during support hours", "info");
  };

  const cards = [
    {
      icon: Headphones,
      title: "Contact Support",
      description: "Get help from our customer support team via email or phone.",
      action: () => navigate("/contact"),
      cta: "Contact us →",
      gradient: "from-gw-red/10 to-gw-red/5 text-gw-red",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat instantly with a support agent — fastest way to get help.",
      action: openLiveChat,
      cta: "Start live chat →",
      gradient: "from-green-100 to-green-50 text-gw-green",
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Answers to common questions about orders, shipping and returns.",
      action: () => navigate("/faq"),
      cta: "View FAQ →",
      gradient: "from-gray-100 to-gray-50 text-gw-gray-700",
    },
    {
      icon: RotateCcw,
      title: "Return Policy",
      description: "Learn about our 30-day hassle-free return and exchange policy.",
      action: () => navigate("/privacy"),
      cta: "Read policy →",
      gradient: "from-yellow-100 to-yellow-50 text-gw-yellow",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SectionHeader title="Support Center" subtitle="We're here to help you every step of the way" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <motion.button
            key={card.title}
            onClick={card.action}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4 }}
            className="text-left gw-panel-category p-6 hover:shadow-gw-md transition-shadow"
          >
            <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4", card.gradient)}>
              <card.icon className="w-6 h-6" />
            </div>
            <h4 className="font-bold gw-text-body">{card.title}</h4>
            <p className="gw-muted-sm mt-1 mb-3">{card.description}</p>
            <span className="text-sm font-semibold text-gw-red">{card.cta}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-5 gw-panel-category p-6">
        <h4 className="font-bold gw-text-body mb-4">Contact Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gw-red shrink-0" />
            <div>
              <p className="font-medium gw-text-body">Email</p>
              <p className="gw-muted">support@gadgetwallet.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Headphones className="w-5 h-5 text-gw-red shrink-0" />
            <div>
              <p className="font-medium gw-text-body">Phone</p>
              <p className="gw-muted">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gw-red shrink-0" />
            <div>
              <p className="font-medium gw-text-body">Hours</p>
              <p className="gw-muted">Mon–Sat, 9AM – 9PM</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
