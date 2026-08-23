"use client";
// NOTE: This app renders sonner's <Toaster /> globally in src/app/layout.tsx.
// This file used to have its OWN parallel toast system (listeners + a
// <ToastContainer /> component) that was never mounted anywhere — so every
// showToast() call across the app (mock tests, journal, planner, wellbeing,
// flashcards, AI doubt solver, dashboard) silently did nothing. showToast()
// now just forwards to sonner so all those call sites start actually working,
// with zero changes needed at the call sites.
import { toast } from "sonner";

type ToastType = "success" | "error" | "warning" | "info";

export function showToast(message: string, type: ToastType = "info", duration: number = 4000) {
  const options = { duration };
  switch (type) {
    case "success":
      toast.success(message, options);
      break;
    case "error":
      toast.error(message, options);
      break;
    case "warning":
      toast.warning(message, options);
      break;
    default:
      toast(message, options);
  }
}

// Kept as a no-op for backwards compatibility in case anything still imports
// it — sonner's <Toaster /> in the root layout is the one actually rendering.
export function ToastContainer() {
  return null;
}
