import { cn } from "./utils";
import type { ReactNode, HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "sale" | "new" | "default";
  children: ReactNode;
}

export function Badge({ variant = "default", children, className, ...props }: BadgeProps) {
  const variants = {
    sale: "bg-gw-red text-white",
    new: "bg-gw-green text-white",
    default: "bg-gw-black text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
