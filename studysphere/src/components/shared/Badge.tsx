import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "electric" | "neon" | "warning" | "danger" | "outline";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-charcoal-700/50 text-charcoal-200 border-charcoal-600/50",
  electric: "bg-electric/20 text-electric-300 border-electric/30",
  neon: "bg-neon/20 text-neon-300 border-neon/30",
  warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  danger: "bg-red-500/20 text-red-300 border-red-500/30",
  outline: "bg-transparent text-charcoal-300 border-charcoal-500",
};

const sizeStyles: Record<BadgeSize, string> = { sm: "px-2 py-0.5 text-xs", md: "px-2.5 py-1 text-xs" };

export function Badge({ variant = "default", size = "sm", children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center font-medium rounded-full border", variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </span>
  );
}
