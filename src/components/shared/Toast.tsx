"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

type ToastType = "success" | "error" | "warning" | "info";
interface ToastData { id: string; message: string; type: ToastType; duration?: number; }

const typeStyles: Record<ToastType, string> = {
  success: "border-neon/30 text-neon-300", error: "border-red-500/30 text-red-300",
  warning: "border-yellow-500/30 text-yellow-300", info: "border-electric/30 text-electric-300",
};
const typeIcons: Record<ToastType, string> = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };

let toastListeners: Array<(toasts: ToastData[]) => void> = [];
let toasts: ToastData[] = [];
function notifyListeners() { toastListeners.forEach((listener) => listener([...toasts])); }

export function showToast(message: string, type: ToastType = "info", duration: number = 4000) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toasts = [...toasts, { id, message, type, duration }];
  notifyListeners();
  if (duration > 0) {
    setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); notifyListeners(); }, duration);
  }
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<ToastData[]>([]);
  useEffect(() => {
    toastListeners.push(setCurrentToasts);
    return () => { toastListeners = toastListeners.filter((l) => l !== setCurrentToasts); };
  }, []);
  const removeToast = useCallback((id: string) => { toasts = toasts.filter((t) => t.id !== id); notifyListeners(); }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {currentToasts.map((toast) => (
          <motion.div
            key={toast.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }}
            className={cn("glass rounded-xl px-4 py-3 border flex items-center gap-3 cursor-pointer", typeStyles[toast.type])}
            onClick={() => removeToast(toast.id)}
          >
            <span className="text-lg">{typeIcons[toast.type]}</span>
            <p className="text-sm text-charcoal-100 flex-1">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
