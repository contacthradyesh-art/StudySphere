'use client';

import { GlowCard } from './glow-card';
import { formatDuration } from '@/lib/utils';
import type { TodayGoalStats } from '@/lib/planner/schedule';

export function TodayGoalCard({ stats }: { stats: TodayGoalStats }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (stats.completionPct / 100) * circumference;

  return (
    <GlowCard delay={0.05} accent="#fbbf24" className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto grid h-28 w-28 shrink-0 place-items-center sm:mx-0">
        <svg viewBox="0 0 96 96" className="h-28 w-28 -rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={r} fill="none" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Today</span>
          <span className="text-2xl font-bold">{stats.completionPct}%</span>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold">Today&apos;s Goal</p>
            <p className="text-xs text-muted-foreground">
              {stats.totalTasks} Tasks
              {stats.plannedFocusMinutes > 0 && ` \u2022 ${formatDuration(stats.plannedFocusMinutes * 60)} Focus`}
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-amber-300">
            {stats.completedTasks} / {stats.totalTasks} Completed
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
            style={{ width: `${stats.completionPct}%` }}
          />
        </div>
        {stats.actualFocusMinutes > 0 && (
          <p className="text-xs text-muted-foreground">
            Actual focus so far: {formatDuration(stats.actualFocusMinutes * 60)}
          </p>
        )}
      </div>
    </GlowCard>
  );
}
