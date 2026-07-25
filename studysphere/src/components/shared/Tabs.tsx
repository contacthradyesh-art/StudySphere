"use client";
import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface Tab { id: string; label: string; icon?: ReactNode; }

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange: (tabId: string) => void;
  variant?: "default" | "pills";
  fullWidth?: boolean;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = "default", fullWidth = false, className }: TabsProps) {
  const currentTab = activeTab || tabs[0]?.id;
  return (
    <div className={cn("flex gap-1 p-1 rounded-xl", variant === "default" && "bg-charcoal-900/50 border border-charcoal-700/30", fullWidth && "w-full", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id} onClick={() => onChange(tab.id)}
          className={cn(
            "relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            fullWidth && "flex-1",
            currentTab === tab.id ? "text-charcoal-50" : "text-charcoal-400 hover:text-charcoal-200"
          )}
        >
          {currentTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className={cn("absolute inset-0 rounded-lg", variant === "default" ? "bg-charcoal-700/50" : "bg-electric/20 border border-electric/30")}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">{tab.icon}{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
