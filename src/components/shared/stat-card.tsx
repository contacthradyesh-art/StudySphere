'use client';

import type { LucideIcon } from 'lucide-react';
import { GlassCard } from './glass-card';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  delay?: number;
}

/** Single KPI tile: icon, value and label with subtle gradient accent. */
export function StatCard({ label, value, icon: Icon, hint, delay }: StatCardProps) {
  return (
    <GlassCard delay={delay} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-white">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </GlassCard>
  );
}
