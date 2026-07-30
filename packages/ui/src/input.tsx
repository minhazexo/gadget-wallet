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
        <label htmlFor={id} className="block text-sm font-medium text-gw-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full px-4 py-2.5 bg-gw-surface border border-white/10 rounded-lg text-gw-text-primary",
          "placeholder:text-gw-text-secondary/50",
          "focus:outline-none focus:ring-2 focus:ring-gw-accent/50 focus:border-gw-accent",
          "transition-all duration-200",
          error && "border-red-500 focus:ring-red-500/50",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
