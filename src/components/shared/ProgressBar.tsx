"use client";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "electric" | "neon" | "warning" | "danger" | "gradient";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const variantColors: Record<string, string> = {
  electric: "bg-electric", neon: "bg-neon", warning: "bg-yellow-500", danger: "bg-red-500",
  gradient: "bg-gradient-to-r from-electric to-neon",
};

const sizeStyles: Record<string, string> = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

export function ProgressBar({ value, max = 100, variant = "electric", size = "md", showLabel = false, label, animated = true, className }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-charcoal-300">{label}</span>}
          {showLabel && <span className="text-xs font-medium text-charcoal-200">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-charcoal-800/50 overflow-hidden", sizeStyles[size])}>
        <motion.div
          className={cn("h-full rounded-full", variantColors[variant])}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
