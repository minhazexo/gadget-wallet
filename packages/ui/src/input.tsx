import { cn } from "./utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gw-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full h-[46px] px-4 bg-white border border-gw-border rounded-btn text-gw-black placeholder:text-gw-gray-300",
          "focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red",
          "transition-all duration-200",
          error && "border-gw-red focus:ring-gw-red/20",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-gw-red">{error}</p>}
    </div>
  );
}
