'use client';

import { Clock3, Flame, Sparkles, Target } from 'lucide-react';
import { GlowCard } from '@/components/planner/premium/glow-card';
import { cn } from '@/lib/utils';

export type DayBlock = {
  id: string;
  title: string;
  startTime?: string;
  endTime?: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
};

type Props = {
  blocks?: DayBlock[];
  nextAction?: string;
  streak?: number;
};

function toMinutes(value?: string) {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function DayCommandCenter({ blocks = [], nextAction, streak = 0 }: Props) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sorted = [...blocks].sort((a, b) => (toMinutes(a.startTime) ?? 9999) - (toMinutes(b.startTime) ?? 9999));
  const completed = sorted.filter((block) => block.completed).length;
  const progress = sorted.length ? Math.round((completed / sorted.length) * 100) : 0;

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

      {nextAction && (
        <div className="flex items-center gap-3 border-b border-white/[0.06] bg-primary/[0.06] px-5 py-4 sm:px-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Target className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Next best action</p>
            <p className="truncate text-sm font-semibold">{nextAction}</p>
          </div>
        </div>
      )}

      <div className="divide-y divide-white/[0.05]">
        {sorted.length === 0 ? (
          <div className="p-8 text-center">
            <Clock3 className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 font-semibold">Your day is open</p>
            <p className="mt-1 text-sm text-muted-foreground">Add a time block to build your schedule.</p>
          </div>
        ) : (
          sorted.map((block) => {
            const start = toMinutes(block.startTime);
            const active = !block.completed && start !== null && start <= currentMinutes;
            return (
              <div key={block.id} className={cn('flex items-center gap-4 px-5 py-4 transition-colors sm:px-6', active && 'bg-primary/[0.06]')}>
                <div className="w-20 shrink-0 text-xs font-semibold text-muted-foreground">
                  <div>{block.startTime || 'Anytime'}</div>
                  {block.endTime && <div className="mt-0.5 text-[10px] opacity-60">to {block.endTime}</div>}
                </div>
                <div className={cn('h-9 w-1 rounded-full', block.completed ? 'bg-emerald-400' : active ? 'bg-primary' : 'bg-white/15')} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn('truncate text-sm font-semibold', block.completed && 'text-muted-foreground line-through')}>{block.title}</p>
                    {active && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">NOW</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{block.category || 'Personal'} · {block.priority || 'medium'} priority</p>
                </div>
                {block.completed && <span className="text-xs font-semibold text-emerald-400">Done</span>}
              </div>
            );
          })
        )}
      </div>
    </GlowCard>
  );
}
