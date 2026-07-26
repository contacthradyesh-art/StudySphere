'use client';

import { motion } from 'framer-motion';
import { Flame, Gauge, ListChecks, Sparkles, Timer } from 'lucide-react';
import { GlowCard } from './glow-card';
import { formatDuration } from '@/lib/utils';
import type { usePlannerInsights } from '@/hooks/use-planner-insights';

type Insights = ReturnType<typeof usePlannerInsights>;

function HeroStat({
  icon: Icon, label, value, hint, delay, accent
}: { icon: typeof Flame; label: string; value: string; hint: string; delay: number; accent: string }) {
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
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
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

  return (
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
      <HeroStat icon={Sparkles} label="XP Earned" value={`${gamification.profile.totalXp}`} hint={`Level ${gamification.level.level}`} delay={0.2} accent="#ec4899" />
    </div>
  );
}
