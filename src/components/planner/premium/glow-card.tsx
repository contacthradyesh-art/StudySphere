'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Hex color used for the hover glow + border gradient accent. Defaults to brand purple. */
  accent?: string;
}

/**
 * Premium glass surface used across the new planner dashboard sections.
 * Built on the same `.glass` token as the existing GlassCard so it stays
 * visually consistent with the rest of the app, with an added gradient
 * border sheen and soft glow on hover for the "flagship feature" feel.
 */
export function GlowCard({ children, className, delay = 0, accent = '#8b5cf6' }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      style={{ '--glow': accent } as React.CSSProperties}
      className={cn(
        'glass group relative overflow-hidden rounded-2xl p-5 transition-shadow duration-300',
        'before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-300',
        'before:[background:linear-gradient(135deg,var(--glow)_0%,transparent_40%,transparent_60%,var(--glow)_100%)] before:[mask:linear-gradient(#fff,#fff)_content-box,linear-gradient(#fff,#fff)] before:p-px before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]',
        'hover:shadow-[0_0_40px_-10px_var(--glow)] hover:before:opacity-30',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/** Small eyebrow + title pairing used to head each dashboard section. */
export function SectionHeading({
  eyebrow, title, action
}: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">{eyebrow}</p>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}
