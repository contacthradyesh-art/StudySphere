'use client';

import { Flame, Target, Clock3, Sparkles } from 'lucide-react';
import { GlowCard } from './glow-card';
import { formatDuration } from '@/lib/utils';

interface DailyStatsRowProps {
  streakDays: number;
  planCompletionPct: number;
  studyTodaySeconds: number;
  totalXp: number;
}

function StatCard({
  icon: Icon, value, label, accent, delay
}: { icon: typeof Flame; value: string; label: string; accent: string; delay: number }) {
  return (
    <GlowCard delay={delay} accent={accent} className="flex items-center gap-3 p-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${accent}22`, color: accent }}>
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold leading-tight">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      </div>
    </GlowCard>
  );
}

/** The 4 daily stat cards from the reference design \u2014 all real, live data (no hardcoding). */
export function DailyStatsRow({ streakDays, planCompletionPct, studyTodaySeconds, totalXp }: DailyStatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard icon={Flame} value={`${streakDays} Days`} label="Streak" accent="#f97316" delay={0} />
      <StatCard icon={Target} value={`${planCompletionPct}%`} label="Plan Completion" accent="#38bdf8" delay={0.04} />
      <StatCard icon={Clock3} value={formatDuration(studyTodaySeconds)} label="Study Today" accent="#a78bfa" delay={0.08} />
      <StatCard icon={Sparkles} value={totalXp.toLocaleString()} label="Total XP" accent="#fbbf24" delay={0.12} />
    </div>
  );
}
