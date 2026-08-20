'use client';

import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { GlowCard } from '@/components/planner/premium/glow-card';
import { HabitStreakBadge } from '@/components/planner/premium/habit-streak-badge';
import { HabitHeatmap } from '@/components/planner/premium/habit-heatmap';
import type { HabitProgress } from '@/hooks/use-habit-insights';

function HabitIcon({ name }: { name: string }) {
  const Icon = (Icons as any)[name] ?? Icons.Sparkles;
  return <Icon className="h-4 w-4" />;
}

export function HabitCard({
  data, onToggleToday, onDelete
}: { data: HabitProgress; onToggleToday: () => void; onDelete: () => void }) {
  const { habit, streak, completedToday } = data;

  return (
    <GlowCard accent={habit.color || '#8b5cf6'} className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="grid h-9 w-9 place-items-center rounded-lg text-white"
            style={{ background: `linear-gradient(135deg, ${habit.color || '#8b5cf6'}, #ec4899)` }}
          >
            <HabitIcon name={habit.icon} />
          </span>
          <div>
            <p className="font-semibold leading-tight">{habit.title}</p>
            <p className="text-xs capitalize text-muted-foreground">{habit.frequency}</p>
          </div>
        </div>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <HabitHeatmap data={data} accent={habit.color || '#8b5cf6'} />

      <div className="flex items-center justify-between">
        <HabitStreakBadge streak={streak} />
        <button
          onClick={onToggleToday}
          className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/70"
        >
          {completedToday ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
          {completedToday ? 'Done today' : 'Mark today'}
        </button>
      </div>
    </GlowCard>
  );
}
