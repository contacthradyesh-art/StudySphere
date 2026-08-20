'use client';

import type { HabitProgress } from '@/hooks/use-habit-insights';

export function HabitHeatmap({ data, accent = '#8b5cf6' }: { data: HabitProgress; accent?: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      {data.last30Days.map((d) => (
        <div
          key={d.dateMs}
          title={new Date(d.dateMs).toLocaleDateString()}
          className="h-3 w-3 rounded-sm"
          style={{ background: d.completed ? accent : 'rgba(255,255,255,0.08)' }}
        />
      ))}
    </div>
  );
}
