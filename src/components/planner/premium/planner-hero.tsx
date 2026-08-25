'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, BellRing, CheckCircle2, Clock3, Flame, Gauge, ListChecks, Sparkles, Target, Timer, Zap } from 'lucide-react';
import { GlowCard } from './glow-card';
import { formatDuration } from '@/lib/utils';
import type { usePlannerInsights } from '@/hooks/use-planner-insights';

type Insights = ReturnType<typeof usePlannerInsights>;

const DAY_START = 6;
const DAY_END = 24;
const HOUR_HEIGHT = 68;

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
        <span className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105" style={{ background: `linear-gradient(135deg, ${accent}, #ec4899)` }}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <motion.p key={value} initial={{ opacity: 0, y: 5, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="text-2xl font-bold tracking-tight">
          {value}
        </motion.p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </GlowCard>
  );
}

function minutesFromTime(value?: string | null) {
  if (!value) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function priorityClass(priority: 'low' | 'medium' | 'high') {
  if (priority === 'high') return 'border-rose-400/25 bg-rose-400/10 text-rose-300';
  if (priority === 'medium') return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
  return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
}

export function PlannerHero({ insights }: { insights: Insights }) {
  const { dashboardStats, gamification, tasksTodayDone, tasksToday, focusScore } = insights;
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');

  const missionPct = tasksToday.length === 0 ? 0 : Math.round((tasksTodayDone / tasksToday.length) * 100);
  const streakScore = Math.min(100, dashboardStats.streakDays * 5);
  const lifeScore = Math.max(0, Math.min(100, Math.round((focusScore * 0.5) + (missionPct * 0.3) + (streakScore * 0.2))));
  const nextTask = tasksToday.find((task) => !task.completed);
  const lifeState = lifeScore >= 80 ? 'Excellent momentum' : lifeScore >= 60 ? 'Building momentum' : lifeScore >= 40 ? 'Reset and refocus' : 'Start with one win';
  const ring = `conic-gradient(#8b5cf6 ${lifeScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`;

  const scheduledTasks = useMemo(
    () => tasksToday
      .filter((task) => minutesFromTime(task.startTime) !== null)
      .sort((a, b) => (minutesFromTime(a.startTime) ?? 0) - (minutesFromTime(b.startTime) ?? 0)),
    [tasksToday]
  );
  const unscheduledCount = tasksToday.filter((task) => minutesFromTime(task.startTime) === null).length;
  const plannedMinutes = scheduledTasks.reduce((total, task) => {
    const start = minutesFromTime(task.startTime);
    const end = minutesFromTime(task.endTime);
    return start !== null && end !== null && end > start ? total + end - start : total;
  }, 0);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = (nowMinutes - DAY_START * 60) * (HOUR_HEIGHT / 60);
  const showNow = nowMinutes >= DAY_START * 60 && nowMinutes <= DAY_END * 60;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }
    setNotificationPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;
      const sent = JSON.parse(sessionStorage.getItem('studysphere-reminders') || '{}') as Record<string, number>;
      const current = Date.now();
      for (const task of tasksToday) {
        if (!task.reminderAt || task.completed) continue;
        if (Math.abs(current - task.reminderAt) > 45_000 || sent[task.id]) continue;
        try {
          new Notification('StudySphere reminder', { body: task.title, tag: `task-${task.id}` });
          sent[task.id] = current;
        } catch {
          // Some browsers/devices restrict page-level notifications.
        }
      }
      sessionStorage.setItem('studysphere-reminders', JSON.stringify(sent));
    };
    checkReminders();
    const interval = window.setInterval(checkReminders, 30_000);
    return () => window.clearInterval(interval);
  }, [tasksToday]);

  async function enableNotifications() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }

  return (
    <section className="space-y-4">
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
              {nextTask ? `Next best move: “${nextTask.title}”. Protect your focus by doing one meaningful block at a time.` : tasksToday.length === 0 ? 'Your day is open. Add a few intentional blocks instead of filling every minute.' : 'Today’s mission is complete. Protect the momentum with a focused review or habit win.'}
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
          <div className="px-4 py-3 text-center md:text-left"><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mission</p><p className="mt-0.5 text-sm font-bold">{missionPct}% complete</p></div>
          <div className="border-x border-white/10 px-4 py-3 text-center md:text-left"><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Streak</p><p className="mt-0.5 text-sm font-bold">{dashboardStats.streakDays} days</p></div>
          <div className="px-4 py-3 text-center md:text-left"><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Level</p><p className="mt-0.5 text-sm font-bold">Level {gamification.level.level}</p></div>
        </div>
      </GlowCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <HeroStat icon={Gauge} label="Focus Score" value={`${focusScore}`} hint="Plan adherence + quality" delay={0} accent="#8b5cf6" />
        <HeroStat icon={ListChecks} label="Tasks Today" value={`${tasksTodayDone}/${tasksToday.length}`} hint={tasksToday.length === 0 ? 'Nothing due today' : 'Completed today'} delay={0.05} accent="#6366f1" />
        <HeroStat icon={Timer} label="Study Time Today" value={formatDuration(dashboardStats.dailySeconds)} hint="Focused minutes logged" delay={0.1} accent="#a78bfa" />
        <HeroStat icon={Flame} label="Study Streak" value={`${dashboardStats.streakDays}d`} hint="Consecutive active days" delay={0.15} accent="#f472b6" />
        <HeroStat icon={Zap} label="XP Earned" value={`${gamification.profile.totalXp}`} hint={`Level ${gamification.level.level}`} delay={0.2} accent="#ec4899" />
      </div>

      <GlowCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-violet-300" /><p className="text-sm font-bold">Today at a glance</p></div>
            <p className="mt-1 text-xs text-muted-foreground">Your complete day flow — scheduled blocks first, unscheduled work stays visible below.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">{scheduledTasks.length} blocks</span>
            <span className="rounded-full border border-violet-400/15 bg-violet-400/10 px-2.5 py-1 text-[10px] font-semibold text-violet-300">{formatMinutes(plannedMinutes)} planned</span>
            {notificationPermission === 'granted' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300"><BellRing className="h-3 w-3" /> Reminders on</span>
            ) : notificationPermission === 'unsupported' ? null : (
              <button type="button" onClick={enableNotifications} disabled={notificationPermission === 'denied'} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40"><Bell className="h-3 w-3" /> Enable reminders</button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="relative min-w-[680px]" style={{ height: (DAY_END - DAY_START) * HOUR_HEIGHT + 28 }}>
            {Array.from({ length: DAY_END - DAY_START + 1 }, (_, index) => {
              const hour = DAY_START + index;
              return <div key={hour} className="absolute inset-x-0 flex items-start" style={{ top: index * HOUR_HEIGHT }}><div className="w-16 shrink-0 px-3 text-right text-[10px] font-semibold text-muted-foreground/70">{String(hour).padStart(2, '0')}:00</div><div className="h-px flex-1 bg-white/[0.07]" /></div>;
            })}

            {showNow && <div className="pointer-events-none absolute left-16 right-4 z-20 flex items-center" style={{ top: nowTop }}><span className="mr-2 h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(139,92,246,0.8)]" /><div className="h-px flex-1 bg-violet-400/70" /><span className="ml-2 rounded-full bg-violet-500/15 px-2 py-0.5 text-[9px] font-bold text-violet-300">NOW</span></div>}

            {scheduledTasks.map((task) => {
              const start = minutesFromTime(task.startTime)!;
              const end = minutesFromTime(task.endTime) ?? start + 45;
              const top = (start - DAY_START * 60) * (HOUR_HEIGHT / 60) + 4;
              const height = Math.max(42, (end - start) * (HOUR_HEIGHT / 60) - 7);
              return <motion.div key={task.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="absolute left-20 right-4" style={{ top, height }}>
                <div className={`group flex h-full gap-3 overflow-hidden rounded-2xl border p-3 shadow-lg transition-all hover:border-violet-400/30 ${task.completed ? 'border-emerald-400/20 bg-emerald-400/[0.07]' : 'border-white/10 bg-white/[0.045]'}`}>
                  <div className={`w-1 shrink-0 rounded-full ${task.completed ? 'bg-emerald-400/70' : task.priority === 'high' ? 'bg-rose-400/80' : 'bg-violet-400/70'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2"><p className={`truncate text-sm font-bold ${task.completed ? 'text-muted-foreground line-through' : ''}`}>{task.title}</p><span className="shrink-0 text-[10px] font-semibold text-muted-foreground">{task.startTime}{task.endTime ? `–${task.endTime}` : ''}</span></div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5"><span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${priorityClass(task.priority)}`}>{task.priority}</span>{task.subject && <span className="rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-muted-foreground">{task.subject}</span>}{task.reminderAt && <BellRing className="h-3 w-3 text-violet-300" />}</div>
                    {height > 65 && <p className="mt-2 text-[10px] text-muted-foreground">{task.completed ? 'Completed — protect the momentum.' : 'Stay with this block until the end time.'}</p>}
                  </div>
                </div>
              </motion.div>;
            })}

            {scheduledTasks.length === 0 && <div className="absolute inset-0 grid place-items-center p-8 text-center"><div className="max-w-sm"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-400/10 text-violet-300"><Clock3 className="h-5 w-5" /></div><p className="mt-3 text-sm font-bold">Design your day with time blocks.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Your tasks already support start and end times. Add them from the Tasks tab and they will appear here automatically.</p></div></div>}
          </div>
        </div>

        {unscheduledCount > 0 && <div className="border-t border-white/10 bg-white/[0.02] px-4 py-3 md:px-5"><div className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-lg bg-amber-400/10 text-amber-300"><Target className="h-3.5 w-3.5" /></span><p className="text-xs font-semibold">{unscheduledCount} task{unscheduledCount > 1 ? 's' : ''} without a time</p><span className="text-[10px] text-muted-foreground">Set a start time to turn the task into a block.</span></div></div>}
      </GlowCard>
    </section>
  );
}

function formatMinutes(minutes: number) {
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}
