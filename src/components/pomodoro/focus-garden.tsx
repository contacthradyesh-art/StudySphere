'use client';

import { GlassCard } from '@/components/shared/glass-card';
import type { PomodoroPhase } from '@/lib/firestore/pomodoro-schema';

interface SessionLike {
  phase: PomodoroPhase;
  completedSeconds: number;
}

export function FocusGarden({ sessions }: { sessions: SessionLike[] }) {
  const focusSeconds = sessions.filter((s) => s.phase === 'focus').reduce((sum, s) => sum + (s.completedSeconds || 0), 0);
  const focusMinutes = Math.floor(focusSeconds / 60);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySeconds = sessions
    .filter((s: any) => s.phase === 'focus' && s.createdAt?.toDate?.()?.toISOString?.().slice(0, 10) === todayKey)
    .reduce((sum, s) => sum + (s.completedSeconds || 0), 0);

  const stage = focusMinutes < 25 ? 0 : focusMinutes < 50 ? 1 : focusMinutes < 90 ? 2 : focusMinutes < 150 ? 3 : 4;
  const labels = ['Seed', 'Sprout', 'Growing', 'Young tree', 'Blooming tree'];
  const stageMessage = stage === 0 ? 'Start a focus session to plant your seed.' : stage < 4 ? 'Keep focusing to grow your tree.' : 'Great work. Your study tree is in bloom.';
  const todayMinutes = Math.floor(todaySeconds / 60);
  const health = Math.min(100, Math.round((todayMinutes / 120) * 100));

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Focus Garden</p>
          <h2 className="mt-1 text-xl font-bold">Grow your study tree</h2>
          <p className="mt-1 text-sm text-muted-foreground">Every real focus minute helps it grow. Missed days gently reduce its health.</p>
        </div>
        <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{labels[stage]}</div>
      </div>

      <div className="mt-5 flex items-end justify-center rounded-2xl border border-border/50 bg-background/30 py-7">
        <div className="relative flex h-32 w-40 items-end justify-center">
          <div className="absolute bottom-2 h-5 w-24 rounded-full bg-muted/40 blur-sm" />
          <div className="z-10 h-16 w-3 rounded-full bg-amber-800/80" />
          {stage === 0 && <div className="absolute bottom-16 h-3 w-7 rounded-full bg-emerald-500/70" />}
          {stage >= 1 && <div className="absolute bottom-14 h-16 w-16 rounded-full bg-emerald-500/70" />}
          {stage >= 2 && <div className="absolute bottom-20 left-14 h-14 w-14 rounded-full bg-emerald-400/70" />}
          {stage >= 2 && <div className="absolute bottom-24 right-12 h-12 w-12 rounded-full bg-green-500/70" />}
          {stage >= 3 && <div className="absolute bottom-20 left-7 h-20 w-20 rounded-full bg-emerald-600/70" />}
          {stage >= 4 && <div className="absolute bottom-28 left-14 text-3xl">🌸</div>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total focused</span>
        <span className="font-semibold">{focusMinutes} min</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/50">
        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.max(stage === 0 ? 4 : 20, ((focusMinutes % 150) / 150) * 100)}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Today: {todayMinutes} min</span>
        <span>Health: {health}%</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{stageMessage}</p>
    </GlassCard>
  );
}
