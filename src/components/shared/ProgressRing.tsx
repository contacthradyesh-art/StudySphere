"use client";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  variant?: "electric" | "neon" | "warning" | "danger";
  showValue?: boolean;
  label?: string;
  className?: string;
}

const variantColors: Record<string, string> = {
  electric: "#007edc", neon: "#00e805", warning: "#ffb800", danger: "#ff4757",
};

export function ProgressRing({ value, size = 80, strokeWidth = 6, variant = "electric", showValue = true, label, className }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(63, 65, 80, 0.5)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={variantColors[variant]}
          strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-charcoal-50">{Math.round(percentage)}%</span>
          {label && <span className="text-[10px] text-charcoal-400 mt-0.5">{label}</span>}
        </div>
      )}
    </div>
  );
}
