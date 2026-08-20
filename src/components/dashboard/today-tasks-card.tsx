'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/shared/glass-card';
import { PriorityBadge } from '@/components/planner/priority-badge';
import { useTasksSync } from '@/hooks/use-tasks';
import { usePlannerStore, selectTasksForDate } from '@/store/planner-store';

/** Live "Today's tasks" card backed by the planner store (Milestone 2). */
export function TodayTasksCard({ delay }: { delay?: number }) {
  useTasksSync();
  const tasks = usePlannerStore((s) => s.tasks);
  const today = new Date().toISOString().slice(0, 10);
  const todays = selectTasksForDate(tasks, today).slice(0, 5);

  return (
    <GlassCard delay={delay} className="lg:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">Today's tasks</h2>
        <Link href="/dashboard/planner" className="text-xs text-primary hover:underline">Open planner</Link>
      </div>
      {todays.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing due today. Add tasks in the planner.</p>
      ) : (
        <ul className="space-y-2">
          {todays.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
              <span className={t.completed ? 'text-muted-foreground line-through' : ''}>{t.title}</span>
              <PriorityBadge priority={t.priority} />
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
