'use client';

import { Clock3, Flame, Pencil, Plus, Sparkles, Target } from 'lucide-react';
import { GlowCard } from '@/components/planner/premium/glow-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/firestore/planner-schema';

type Props = {
  tasks?: Task[];
  onToggle?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onNewTask?: () => void;
};

function toMinutes(value?: string | null) {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function DayCommandCenter({ tasks = [], onToggle, onEdit, onNewTask }: Props) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = now.toISOString().slice(0, 10);

  const todayTasks = tasks
    .filter((task) => task.dueDate === today)
    .sort((a, b) => (toMinutes(a.startTime) ?? 9999) - (toMinutes(b.startTime) ?? 9999));

  const completed = todayTasks.filter((task) => task.completed).length;
  const progress = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0;
  const nextAction = todayTasks.find((task) => !task.completed);
  const streak = todayTasks.filter((task) => task.completed).length;

  return (
    <GlowCard className="overflow-hidden border-white/[0.08] bg-gradient-to-br from-white/[0.045] via-white/[0.025] to-primary/[0.08] p-0">
      <div className="border-b border-white/[0.07] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-4 w-4" /> Life OS · Today
            </div>
            <h2 className="text-xl font-bold sm:text-2xl">Your Day Command Center</h2>
            <p className="mt-1 text-sm text-muted-foreground">One clear timeline for everything that matters today.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Day progress</p>
              <p className="text-lg font-bold">{progress}%</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Flame className="h-4 w-4 text-orange-400" /> {streak}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-primary/[0.06] px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><Target className="h-4 w-4" /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Next best action</p>
            <p className="truncate text-sm font-semibold">{nextAction?.title || 'Plan your first focused block'}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onNewTask}><Plus className="h-4 w-4" /> Add block</Button>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {todayTasks.length === 0 ? (
          <div className="p-8 text-center">
            <Clock3 className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 font-semibold">Your day is open</p>
            <p className="mt-1 text-sm text-muted-foreground">Create a timed task and it will appear here automatically.</p>
            <Button className="mt-4 bg-gradient-brand" onClick={onNewTask}><Plus className="h-4 w-4" /> Plan my day</Button>
          </div>
        ) : (
          todayTasks.map((task) => {
            const start = toMinutes(task.startTime);
            const active = !task.completed && start !== null && start <= currentMinutes && (toMinutes(task.endTime) === null || currentMinutes < (toMinutes(task.endTime) as number));
            return (
              <div key={task.id} className={cn('flex items-center gap-3 px-5 py-4 transition-colors sm:px-6', active && 'bg-primary/[0.06]')}>
                <button type="button" onClick={() => onToggle?.(task)} className={cn('h-5 w-5 shrink-0 rounded-full border transition-colors', task.completed ? 'border-emerald-400 bg-emerald-400/20' : 'border-white/25 hover:border-primary')} aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'} />
                <div className="w-20 shrink-0 text-xs font-semibold text-muted-foreground">
                  <div>{task.startTime || 'Anytime'}</div>
                  {task.endTime && <div className="mt-0.5 text-[10px] opacity-60">to {task.endTime}</div>}
                </div>
                <div className={cn('h-9 w-1 rounded-full', task.completed ? 'bg-emerald-400' : active ? 'bg-primary' : 'bg-white/15')} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn('truncate text-sm font-semibold', task.completed && 'text-muted-foreground line-through')}>{task.title}</p>
                    {active && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">NOW</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{task.subject || 'Personal'} · {task.priority} priority</p>
                </div>
                {task.reminderAt && <span className="hidden text-[10px] font-semibold text-amber-300 sm:inline">Reminder</span>}
                <button type="button" onClick={() => onEdit?.(task)} className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground" aria-label={`Edit ${task.title}`}><Pencil className="h-4 w-4" /></button>
              </div>
            );
          })
        )}
      </div>
    </GlowCard>
  );
}
