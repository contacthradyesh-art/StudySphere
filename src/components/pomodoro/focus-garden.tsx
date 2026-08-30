'use client';

import { GlassCard } from '@/components/shared/glass-card';
import type { PomodoroPhase } from '@/lib/firestore/pomodoro-schema';

interface SessionLike {
  phase: PomodoroPhase;
  completedSeconds: number;
  createdAt?: { toDate?: () => Date } | Date | string | number;
}

function toDate(value: SessionLike['createdAt']): Date | null {
  if (!value) return null;
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') return value.toDate();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function FocusGarden({ sessions }: { sessions: SessionLike[] }) {
  const focusSessions = sessions.filter((session) => session.phase === 'focus');
  const focusSeconds = focusSessions.reduce((sum, session) => sum + Math.max(0, session.completedSeconds || 0), 0);
  const focusMinutes = Math.floor(focusSeconds / 60);

  const localDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayKey = localDateKey(new Date());
  const todaySeconds = focusSessions.reduce((sum, session) => {
    const created = toDate(session.createdAt);
    return created && localDateKey(created) === todayKey ? sum + Math.max(0, session.completedSeconds || 0) : sum;
  }, 0);
  const todayMinutes = Math.floor(todaySeconds / 60);

  // Growth is based on actual completed focus time, with 25-minute milestones.
  // The progress bar shows progress toward the next stage rather than resetting at 150m.
  const stages = [
    { max: 25, label: 'Seed', message: 'Start focusing to plant your seed.' },
    { max: 50, label: 'Sprout', message: 'Your first focused block helped it sprout.' },
    { max: 90, label: 'Growing', message: 'Keep going. Your study tree is growing.' },
    { max: 150, label: 'Young tree', message: 'Strong consistency. Your tree is becoming healthier.' },
    { max: Infinity, label: 'Blooming tree', message: 'Excellent work. Your study tree is in bloom.' },
  ];

  const stageIndex = focusMinutes < 25 ? 0 : focusMinutes < 50 ? 1 : focusMinutes < 90 ? 2 : focusMinutes < 150 ? 3 : 4;
  const currentStage = stages[stageIndex];
  const previousThreshold = stageIndex === 0 ? 0 : stages[stageIndex - 1].max;
  const progress = currentStage.max === Infinity
    ? Math.min(100, 70 + Math.min(30, Math.floor((focusMinutes - 150) / 30) * 5))
    : Math.min(100, Math.round(((focusMinutes - previousThreshold) / (currentStage.max - previousThreshold)) * 100));

  // Health reflects today's actual focus, capped at a full productive day.
  const health = Math.min(100, Math.round((todayMinutes / 120) * 100));

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Focus Garden</p>
          <h2 className="mt-1 text-xl font-bold">Grow your study tree</h2>
          <p className="mt-1 text-sm text-muted-foreground">Every completed focus minute helps it grow. Health follows your real study activity.</p>
        </div>
        <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{currentStage.label}</div>
      </div>

      <div className="mt-5 flex items-end justify-center rounded-2xl border border-border/50 bg-background/30 py-7">
        <div className="relative flex h-32 w-40 items-end justify-center">
          <div className="absolute bottom-2 h-5 w-24 rounded-full bg-muted/40 blur-sm" />
          <div className={`z-10 rounded-full bg-amber-800/80 transition-all duration-700 ${stageIndex >= 3 ? 'h-24 w-4' : stageIndex >= 2 ? 'h-20 w-4' : 'h-16 w-3'}`} />
          {stageIndex === 0 && <div className="absolute bottom-16 h-3 w-7 rounded-full bg-emerald-500/70 animate-pulse" />}
          {stageIndex >= 1 && <div className="absolute bottom-14 h-16 w-16 rounded-full bg-emerald-500/70 transition-all duration-700" />}
          {stageIndex >= 2 && <div className="absolute bottom-20 left-14 h-14 w-14 rounded-full bg-emerald-400/70 transition-all duration-700" />}
          {stageIndex >= 2 && <div className="absolute bottom-24 right-12 h-12 w-12 rounded-full bg-green-500/70 transition-all duration-700" />}
          {stageIndex >= 3 && <div className="absolute bottom-20 left-7 h-20 w-20 rounded-full bg-emerald-600/70 transition-all duration-700" />}
          {stageIndex >= 4 && <div className="absolute bottom-28 left-14 text-3xl animate-pulse">🌸</div>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total focused</span>
        <span className="font-semibold">{focusMinutes} min</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/50">
        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.max(4, progress)}%` }} />
      </div>
      <div className="mt-1 text-right text-[11px] text-muted-foreground">
        {currentStage.max === Infinity ? 'Bloom stage' : `${Math.max(0, currentStage.max - focusMinutes)} min to next stage`}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Today: {todayMinutes} min</span>
        <span>Health: {health}%</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{currentStage.message}</p>
    </GlassCard>
  );
}
