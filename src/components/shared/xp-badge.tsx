'use client';

import { Trophy } from 'lucide-react';
import { useGamification } from '@/hooks/use-gamification';

/** Compact level + XP indicator for the top bar. */
export function XpBadge({ streakDays = 0 }: { streakDays?: number }) {
  const { level } = useGamification(streakDays);
  return (
    <div className="flex items-center gap-2 rounded-full border border-input bg-background/60 px-3 py-1 text-xs">
      <Trophy className="h-3.5 w-3.5 text-amber-500" />
      <span className="font-semibold">Lv {level.level}</span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted" aria-hidden>
        <span className="block h-full rounded-full bg-gradient-brand" style={{ width: `${Math.round(level.progress * 100)}%` }} />
      </span>
    </div>
  );
}
