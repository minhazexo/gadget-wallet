import { cn } from "./utils";
import type { ReactNode, HTMLAttributes } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8", className)} {...props}>
      {children}
    </div>
  );
}
