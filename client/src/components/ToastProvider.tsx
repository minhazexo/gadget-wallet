import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { useToastStore } from "../store/useToastStore";

export function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-gw-green" />,
    error: <AlertCircle className="w-5 h-5 text-gw-red" />,
    info: <Info className="w-5 h-5 text-gw-black" />,
  };

  return (
    // top-20 clears the sticky header (mobile header can be tall); the
    // width/max-width caps keep long messages from spanning edge-to-edge.
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto flex items-center gap-3 px-5 py-3 bg-white border border-gw-border rounded-xl shadow-gw-md"
          >
            {icons[toast.type]}
            <p className="text-sm text-gw-gray-700 flex-1">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-1 text-gw-gray-300 hover:text-gw-gray-700 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
