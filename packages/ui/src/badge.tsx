import { cn } from "./utils";
import type { ReactNode, HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "sale" | "new" | "best";
  children: ReactNode;
}

export function Badge({ variant = "default", children, className, ...props }: BadgeProps) {
  const variants = {
    default: "bg-gw-accent/20 text-gw-accent",
    sale: "bg-red-500/20 text-red-400",
    new: "bg-green-500/20 text-green-400",
    best: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
