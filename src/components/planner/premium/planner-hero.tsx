'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Flame, Gauge, ListChecks, Sparkles, Target, Timer, Zap } from 'lucide-react';
import { GlowCard } from './glow-card';
import { formatDuration } from '@/lib/utils';
import type { usePlannerInsights } from '@/hooks/use-planner-insights';

type Insights = ReturnType<typeof usePlannerInsights>;

function HeroStat({
  icon: Icon,
  label,
  value,
  hint,
  delay,
  accent,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  hint: string;
  delay: number;
  accent: string;
}) {
  return (
    <GlowCard delay={delay} accent={accent} className="group flex flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span
          className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${accent}, #ec4899)` }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <motion.p
          key={value}
          initial={{ opacity: 0, y: 5, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="text-2xl font-bold tracking-tight"
        >
          {value}
        </motion.p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </GlowCard>
  );
}

export function PlannerHero({ insights }: { insights: Insights }) {
  const { dashboardStats, gamification, tasksTodayDone, tasksToday, focusScore } = insights;

  const missionPct = tasksToday.length === 0 ? 0 : Math.round((tasksTodayDone / tasksToday.length) * 100);
  const streakScore = Math.min(100, dashboardStats.streakDays * 5);
  const lifeScore = Math.max(0, Math.min(100, Math.round((focusScore * 0.5) + (missionPct * 0.3) + (streakScore * 0.2))));
  const nextTask = tasksToday.find((task) => !task.completed);

  const lifeState = lifeScore >= 80 ? 'Excellent momentum' : lifeScore >= 60 ? 'Building momentum' : lifeScore >= 40 ? 'Reset and refocus' : 'Start with one win';
  const ring = `conic-gradient(#8b5cf6 ${lifeScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`;

  return (
    <section className="space-y-4">
      {/* Premium command center */}
      <GlowCard accent="#8b5cf6" className="relative overflow-hidden p-0">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative grid gap-6 p-5 md:grid-cols-[auto_1fr_auto] md:items-center md:p-6">
          <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{ background: ring }}>
            <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-[#11111a] shadow-inner">
              <div className="text-center">
                <p className="text-2xl font-black leading-none">{lifeScore}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Life score</p>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-300">
                <Sparkles className="h-3 w-3" /> Life OS
              </span>
              <span className="text-xs text-muted-foreground">Personal command center</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">{lifeState}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {nextTask
                ? `Your next best move is “${nextTask.title}”. Finish one meaningful task before adding more.`
                : tasksToday.length === 0
                  ? 'No tasks are due today. Use the quiet space to plan tomorrow or work on a goal.'
                  : 'Today’s mission is complete. Protect the momentum with a focused review or habit win.'}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-300">
              {nextTask ? <Target className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Today</p>
              <p className="text-sm font-bold">{tasksTodayDone}/{tasksToday.length || 0} tasks</p>
            </div>
            <ArrowRight className="ml-1 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="relative grid grid-cols-3 border-t border-white/10 bg-white/[0.025]">
          <div className="px-4 py-3 text-center md:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mission</p>
            <p className="mt-0.5 text-sm font-bold">{missionPct}% complete</p>
          </div>
          <div className="border-x border-white/10 px-4 py-3 text-center md:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Streak</p>
            <p className="mt-0.5 text-sm font-bold">{dashboardStats.streakDays} days</p>
          </div>
          <div className="px-4 py-3 text-center md:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Level</p>
            <p className="mt-0.5 text-sm font-bold">Level {gamification.level.level}</p>
          </div>
        </div>
      </GlowCard>

      {/* Core operating metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <HeroStat icon={Gauge} label="Focus Score" value={`${focusScore}`} hint="Plan adherence + quality" delay={0} accent="#8b5cf6" />
        <HeroStat
          icon={ListChecks}
          label="Tasks Today"
          value={`${tasksTodayDone}/${tasksToday.length}`}
          hint={tasksToday.length === 0 ? 'Nothing due today' : 'Completed today'}
          delay={0.05}
          accent="#6366f1"
        />
        <HeroStat icon={Timer} label="Study Time Today" value={formatDuration(dashboardStats.dailySeconds)} hint="Focused minutes logged" delay={0.1} accent="#a78bfa" />
        <HeroStat icon={Flame} label="Study Streak" value={`${dashboardStats.streakDays}d`} hint="Consecutive active days" delay={0.15} accent="#f472b6" />
        <HeroStat icon={Zap} label="XP Earned" value={`${gamification.profile.totalXp}`} hint={`Level ${gamification.level.level}`} delay={0.2} accent="#ec4899" />
      </div>
    </section>
  );
}
