'use client';

import { Flame } from 'lucide-react';

export function HabitStreakBadge({ streak }: { streak: number }) {
  if (streak === 0) return <span className="text-xs text-muted-foreground">No streak yet</span>;
  return (
    <span className="flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-semibold text-orange-500">
      <Flame className="h-3 w-3" /> {streak}d
    </span>
  );
}
