import { cn } from "./utils";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Renders an eye icon inside the field to reveal/hide the password (only when type="password"). */
  showPasswordToggle?: boolean;
}

export function Input({
  label,
  error,
  className,
  id,
  type = "text",
  showPasswordToggle,
  ...props
}: InputProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gw-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={cn(
            "w-full h-[46px] px-4 bg-white border border-gw-border rounded-btn text-gw-black placeholder:text-gw-gray-300",
            "focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red",
            "transition-all duration-200",
            showPasswordToggle && isPassword && "pr-11",
            error && "border-gw-red focus:ring-gw-red/20",
            className,
          )}
          {...props}
        />
        {showPasswordToggle && isPassword && (
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gw-gray-500 hover:text-gw-red transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gw-red/30"
          >
            {visible ? (
              <EyeOff className="w-[18px] h-[18px]" />
            ) : (
              <Eye className="w-[18px] h-[18px]" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-gw-red">{error}</p>}
    </div>
  );
}
