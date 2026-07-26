"use client";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, fullWidth = true, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && <label htmlFor={inputId} className="text-sm font-medium text-charcoal-200">{label}</label>}
        <div className="relative">
          {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">{leftIcon}</div>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border bg-charcoal-900/60 backdrop-blur-sm px-4 py-2.5",
              "text-charcoal-50 placeholder:text-charcoal-500 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric",
              error ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500" : "border-charcoal-700/50 hover:border-charcoal-600",
              leftIcon && "pl-10", rightIcon && "pr-10", className
            )}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">{rightIcon}</div>}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-charcoal-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
