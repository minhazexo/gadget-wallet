import { cn } from "./utils";
import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

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

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-gw-green" />,
    error: <AlertCircle className="w-5 h-5 text-gw-red" />,
    info: <Info className="w-5 h-5 text-gw-black" />,
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-white border border-gw-border rounded-xl shadow-gw-md">
      {icons[type]}
      <p className="text-sm text-gw-gray-700">{message}</p>
      <button onClick={onClose} className="ml-2 text-gw-gray-300 hover:text-gw-gray-700">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
