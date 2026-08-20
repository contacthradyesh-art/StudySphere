import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type CardVariant = "default" | "glass" | "outlined" | "glow" | "glow-neon";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-charcoal-900 border border-charcoal-700/50",
  glass: "glass",
  outlined: "bg-transparent border border-charcoal-700",
  glow: "glass glow-border",
  "glow-neon": "glass glow-border-neon",
};

const paddingStyles: Record<string, string> = {
  none: "p-0", sm: "p-3 md:p-4", md: "p-4 md:p-6", lg: "p-6 md:p-8",
};

export function Card({ variant = "glass", padding = "md", hoverable = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300",
        variantStyles[variant], paddingStyles[padding],
        hoverable && "hover:scale-[1.02] hover:shadow-glow cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
