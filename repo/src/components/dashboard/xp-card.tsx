'use client';

import { Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';

interface XpCardProps {
  xpToday: number;
  totalXp: number;
  delay?: number;
}

/** Placeholder XP stat tile. Wiring to a real Firestore XP ledger is a future enhancement. */
export function XpCard({ xpToday, totalXp, delay }: XpCardProps) {
  return (
    <GlassCard delay={delay} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">XP Today</span>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-white">
          <Sparkles className="h-4 w-4" />
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">
          {xpToday} <span className="text-sm font-medium text-muted-foreground">XP</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Total XP: {totalXp.toLocaleString()}</p>
      </div>
    </GlassCard>
  );
}