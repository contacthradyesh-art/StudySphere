'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Gauge, Sparkles, Timer, Target,
  TrendingUp, Trophy, Zap, BookOpen, CheckCircle2
} from 'lucide-react';
import { GlowCard, SectionHeading } from '@/components/planner/premium/glow-card';
import { GlassCard } from '@/components/shared/glass-card';
import { StudyHeatmap } from '@/components/planner/premium/study-heatmap';
import { SubjectProgress } from '@/components/planner/premium/subject-progress';
import { AchievementsPanel } from '@/components/planner/premium/achievements-panel';
import { formatDuration } from '@/lib/utils';

import { useTasksSync } from '@/hooks/use-tasks';
import { useSessionsSync } from '@/hooks/use-sessions';
import { useLifeGoalsSync } from '@/hooks/use-lifegoals';
import { useHabitsSync } from '@/hooks/use-habits';

import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useGamification } from '@/hooks/use-gamification';
import { useLifeGoalInsights } from '@/hooks/use-lifegoal-insights';
import { useHabitInsights } from '@/hooks/use-habit-insights';
import { usePomodoroStore } from '@/store/pomodoro-store';
import { usePlannerStore } from '@/store/planner-store';

import {
  buildFocusAnalytics, buildSubjectStats, buildHeatmap
} from '@/lib/planner/analytics';

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, accent, delay
}: {
  icon: typeof Flame; label: string; value: string; sub: string;
  accent: string; delay: number;
}) {
  return (
    <GlowCard delay={delay} accent={accent} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span
          className="grid h-9 w-9 place-items-center rounded-lg text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${accent}, #ec4899)` }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <motion.p
          key={value}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl font-bold tracking-tight"
        >
          {value}
        </motion.p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </div>
    </GlowCard>
  );
}

// ── Weekly bar ────────────────────────────────────────────────────────────────
function WeekBar({ day, hours, maxHours }: { day: string; hours: number; maxHours: number }) {
  const pct = maxHours === 0 ? 0 : (hours / maxHours) * 100;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-medium text-muted-foreground">{hours > 0 ? `${hours}h` : ''}</span>
      <div className="relative w-8 flex-1 overflow-hidden rounded-t-md bg-secondary">
        <motion.div
          className="absolute bottom-0 w-full rounded-t-md bg-gradient-brand"
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground">{day}</span>
    </div>
  );
}

// ── Life areas progress ───────────────────────────────────────────────────────
function LifeAreaRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7 }}
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GrowthOSPage() {
  // Sync all data
  useTasksSync();
  useSessionsSync();
  useLifeGoalsSync();
  useHabitsSync();

  const { stats } = useDashboardStats();
  const gamification = useGamification(stats.streakDays);
  const goalInsights = useLifeGoalInsights();
  const habitInsights = useHabitInsights();
  const sessions = usePomodoroStore((s) => s.sessions);
  const tasks = usePlannerStore((s) => s.tasks);

  const focusAnalytics = useMemo(() => buildFocusAnalytics(sessions), [sessions]);
  const subjectStats   = useMemo(() => buildSubjectStats(tasks, sessions), [tasks, sessions]);
  const heatmapDays    = useMemo(() => buildHeatmap(sessions), [sessions]);

  const maxHours = Math.max(...focusAnalytics.weeklySeries.map((d) => d.hours), 1);

  // Life area scores
  const studyScore  = Math.min(100, Math.round((stats.weeklySeconds / 3600 / 20) * 100));
  const habitScore  = habitInsights.todayCompletionPct;
  const goalScore   = goalInsights.overallProgress;
  const focusScore  = stats.productivityScore;
  const taskScore   = stats.goalProgress;
  const lifeScore   = Math.round((studyScore + habitScore + goalScore + focusScore + taskScore) / 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Growth OS{' '}
          <span className="bg-gradient-brand bg-clip-text text-transparent">✦</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Your complete life operating system. Study · Habits · Goals · Focus · Progress.
        </p>
      </div>

      {/* Life Score banner */}
      <GlowCard accent="#8b5cf6" className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overall Life Score</p>
          <motion.p
            key={lifeScore}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-5xl font-extrabold tabular-nums"
          >
            {lifeScore}
            <span className="ml-1 text-2xl text-muted-foreground">/100</span>
          </motion.p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lifeScore >= 80 ? '🔥 Excellent — keep dominating!' :
             lifeScore >= 60 ? '💪 Good — push harder today!' :
             lifeScore >= 40 ? '⚡ Average — one session can change everything.' :
                               '🌱 Just starting — take one small step now.'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-semibold">Level {gamification.level.level}</span>
          <div className="h-2.5 w-48 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-gradient-brand"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(gamification.level.progress * 100)}%` }}
              transition={{ duration: 0.7 }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {gamification.profile.totalXp} XP · {gamification.level.xpForNext - gamification.level.xpIntoLevel} to next level
          </span>
        </div>
      </GlowCard>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Flame}  label="Streak"      value={`${stats.streakDays}d`}              sub="Consecutive days"      accent="#f472b6" delay={0}    />
        <StatCard icon={Timer}  label="Today"       value={formatDuration(stats.dailySeconds)}   sub="Focused today"         accent="#818cf8" delay={0.05} />
        <StatCard icon={Gauge}  label="Productivity"value={`${stats.productivityScore}%`}        sub="Sessions completed"    accent="#8b5cf6" delay={0.10} />
        <StatCard icon={Target} label="Tasks"       value={`${stats.goalProgress}%`}             sub="Completion rate"       accent="#6366f1" delay={0.15} />
        <StatCard icon={Sparkles}label="XP"         value={`${gamification.profile.totalXp}`}   sub={`Level ${gamification.level.level}`} accent="#ec4899" delay={0.20} />
      </div>

      {/* Life Areas + Weekly Chart */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Life Areas */}
        <GlassCard>
          <SectionHeading eyebrow="Life OS" title="Area scores" />
          <div className="mt-4 space-y-4">
            <LifeAreaRow label="📚 Study"    pct={studyScore}  color="#8b5cf6" />
            <LifeAreaRow label="🔥 Habits"   pct={habitScore}  color="#f472b6" />
            <LifeAreaRow label="🎯 Goals"    pct={goalScore}   color="#6366f1" />
            <LifeAreaRow label="⚡ Focus"    pct={focusScore}  color="#818cf8" />
            <LifeAreaRow label="✅ Tasks"    pct={taskScore}   color="#34d399" />
          </div>
        </GlassCard>

        {/* Weekly bar chart */}
        <GlassCard>
          <SectionHeading eyebrow="Study Hours" title="This week" />
          <div className="mt-4 flex h-32 items-end gap-2">
            {focusAnalytics.weeklySeries.map((d) => (
              <WeekBar key={d.day} day={d.day} hours={d.hours} maxHours={maxHours} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Weekly total</p>
              <p className="text-lg font-bold">{focusAnalytics.weeklyTotalHours}h</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Best time</p>
              <p className="text-lg font-bold">{focusAnalytics.bestHourLabel ?? '—'}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Goals + Habits quick overview */}
      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard>
          <SectionHeading eyebrow="Life Goals" title={`${goalInsights.activeGoalsCount} active · ${goalInsights.completedGoalsCount} done`} />
          <div className="mt-4 space-y-3">
            {goalInsights.goalProgress.length === 0 && (
              <p className="text-sm text-muted-foreground">No goals yet. Add them in the Life Planner → Goals tab.</p>
            )}
            {goalInsights.goalProgress.slice(0, 4).map((g) => (
              <div key={g.goal.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{g.goal.title}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">{g.progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${g.progress}%`, background: g.goal.color || '#8b5cf6' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeading eyebrow="Habits" title={`${habitInsights.todayCompletionPct}% done today`} />
          <div className="mt-4 space-y-2">
            {habitInsights.habitProgress.length === 0 && (
              <p className="text-sm text-muted-foreground">No habits yet. Add them in the Life Planner → Habits tab.</p>
            )}
            {habitInsights.habitProgress.slice(0, 5).map((h) => (
              <div key={h.habit.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  {h.completedToday
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    : <div className="h-4 w-4 rounded-full border border-muted-foreground/40" />
                  }
                  <span className="text-sm">{h.habit.title}</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-orange-400">
                  <Flame className="h-3 w-3" /> {h.streak}d
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Heatmap */}
      <StudyHeatmap days={heatmapDays} />

      {/* Subject progress */}
      {subjectStats.length > 0 && <SubjectProgress subjects={subjectStats} />}

      {/* Achievements */}
      <AchievementsPanel gamification={gamification} />

      {/* XP history summary */}
      <GlassCard>
        <SectionHeading eyebrow="Pomodoro Stats" title="Focus sessions" />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Today', value: formatDuration(stats.dailySeconds), icon: Timer },
            { label: 'This week', value: formatDuration(stats.weeklySeconds), icon: TrendingUp },
            { label: 'This month', value: formatDuration(stats.monthlySeconds), icon: BookOpen },
            { label: 'Sessions today', value: `${stats.pomodoroCount}`, icon: Zap },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <Icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
