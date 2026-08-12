import { cn } from "./utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "dark" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    // active:scale gives every button a press state on touch devices —
    // hover-only feedback never resolves there.
    "inline-flex items-center justify-center font-bold rounded-btn transition-all duration-200 focus:outline-none active:scale-[0.97]";

  const variants = {
    primary: "bg-gw-red text-white hover:bg-gw-red-hover hover:-translate-y-0.5",
    dark: "bg-gw-black text-white hover:bg-gw-red hover:-translate-y-0.5",
    outline: "border-2 border-gw-gray-300 text-gw-gray-700 hover:border-gw-red hover:text-gw-red",
    ghost: "text-gw-gray-500 hover:text-gw-red",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-sm",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
