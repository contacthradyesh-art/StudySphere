"use client";
import { type ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  isLoading?: boolean;
  children?: ReactNode;
}

export function Dialog({ isOpen, onClose, onConfirm, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "default", isLoading = false, children }: DialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {description && <p className="text-sm text-charcoal-300 mb-4">{description}</p>}
      {children}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>{cancelLabel}</Button>
        <Button variant={variant === "danger" ? "danger" : "primary"} size="sm" onClick={onConfirm} isLoading={isLoading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
