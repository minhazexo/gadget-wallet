import { cn } from "./utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type = "info", isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-gw-accent" />,
  };

  const borders = {
    success: "border-green-500/30",
    error: "border-red-500/30",
    info: "border-gw-accent/30",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className={cn(
            "fixed top-4 left-1/2 z-50 flex items-center gap-3 px-5 py-3",
            "bg-gw-surface/95 backdrop-blur-xl border rounded-xl shadow-2xl",
            borders[type],
          )}
        >
          {icons[type]}
          <p className="text-sm text-gw-text-primary">{message}</p>
          <button onClick={onClose} className="ml-2 text-gw-text-secondary hover:text-gw-text-primary">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
