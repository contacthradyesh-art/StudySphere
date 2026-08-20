'use client';

import { Flame, ListChecks } from 'lucide-react';
import { GlowCard } from '@/components/planner/premium/glow-card';
import { useHabitInsights } from '@/hooks/use-habit-insights';

export function HabitsOverviewPanel() {
  const { habits, todayCompletionPct, longestHabitStreak, loading } = useHabitInsights();

  if (loading || habits.length === 0) return null;

  return (
    <GlowCard accent="#10b981" className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-500">
          <ListChecks className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">Today's habits</p>
          <p className="text-xs text-muted-foreground">{todayCompletionPct}% complete</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="font-semibold">{longestHabitStreak}d</span>
        <span className="text-xs text-muted-foreground">longest streak</span>
      </div>
    </GlowCard>
  );
}
