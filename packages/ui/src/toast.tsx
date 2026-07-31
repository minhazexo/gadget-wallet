import { cn } from "./utils";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
}

const toastVariants = {
  hidden: { opacity: 0, y: -40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export function Toast({ message, type = "info", isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: (
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
      >
        <CheckCircle className="w-5 h-5 text-gw-green" />
      </motion.div>
    ),
    error: (
      <motion.div
        initial={{ scale: 0, rotate: 90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
      >
        <AlertCircle className="w-5 h-5 text-gw-red" />
      </motion.div>
    ),
    info: (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
      >
        <Info className="w-5 h-5 text-gw-black" />
      </motion.div>
    ),
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="toast"
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-white border border-gw-border rounded-xl shadow-gw-md"
        >
          {icons[type]}
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm text-gw-gray-700"
          >
            {message}
          </motion.p>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.15, color: "#111827" }}
            whileTap={{ scale: 0.9 }}
            className="ml-2 text-gw-gray-300 hover:text-gw-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
