"use client";
import { useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: "auto" | "half" | "full";
  className?: string;
}

const heightStyles: Record<string, string> = { auto: "max-h-[85vh]", half: "h-[50vh]", full: "h-[90vh]" };

export function BottomSheet({ isOpen, onClose, title, children, height = "auto", className }: BottomSheetProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn("relative w-full max-w-lg glass rounded-t-3xl overflow-hidden", heightStyles[height], className)}
          >
            <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-charcoal-600" /></div>
            {title && (
              <div className="px-4 pb-3 border-b border-charcoal-700/50">
                <h3 className="text-base font-semibold text-charcoal-50">{title}</h3>
              </div>
            )}
            <div className="overflow-y-auto p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
