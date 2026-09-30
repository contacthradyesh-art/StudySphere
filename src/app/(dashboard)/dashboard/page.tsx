'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowRight, CalendarDays, Check, Flame, GraduationCap,
  NotebookPen, Sparkles, Target, Timer, Brain, RefreshCw,
  ChevronRight, Clock3, AlertCircle, Search, Users
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { useTasksSync } from '@/hooks/use-tasks';
import { usePlannerInsights } from '@/hooks/use-planner-insights';
import { toggleTask } from '@/lib/planner/task-service';
import { awardXp } from '@/lib/gamification/xp-service';
import { formatDuration } from '@/utils/formatters';
import type { Task } from '@/lib/firestore/planner-schema';
import { DeadlineCommandCard } from '@/components/planner/premium/deadline-command-card';
import { useLifeGoalsSync } from '@/hooks/use-lifegoals';

export default function DashboardPage() {
  useTasksSync();
  useLifeGoalsSync();
  const router = useRouter();
  const { user } = useAuth();
  const insights = usePlannerInsights();
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.displayName?.trim().split(/\s+/)[0] || 'Student';
  const studySeconds = insights.dashboardStats.dailySeconds;
  const streak = insights.dashboardStats.streakDays;
  const { level } = insights.gamification;
  const pendingToday = useMemo(() => insights.tasksToday.filter((t) => !t.completed).slice(0, 5), [insights.tasksToday]);
  const completedToday = insights.tasksToday.filter((t) => t.completed).length;

  async function handleToggleTask(task: Task) {
    if (!requireAuth(user)) return;
    setBusyTaskId(task.id);
    try {
      await toggleTask(user.uid, task.id, true);
      void awardXp(user.uid, 'completeTask');
      toast.success('Task completed');
    } catch {
      toast.error('Could not update task');
    } finally { setBusyTaskId(null); }
  }

  return <div className="min-w-0 space-y-5 animate-fade-in pb-6">
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_85%_8%,rgba(177,132,255,0.22),transparent_35%),linear-gradient(145deg,#171321,#0d0b12_70%)] p-5 shadow-2xl shadow-black/30 sm:p-7">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200/80">StudySphere · Student OS</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">{greeting}, {firstName}.</h1>
            <p className="mt-1 text-sm text-white/55">Plan less. Focus more. Study with people across India.</p>
          </div>
          <Link href="/dashboard/settings" className="grid h-10 w-10 place-items-center rounded-full border border-violet-300/25 bg-white/5 text-sm font-bold text-violet-100">
            {(user?.displayName?.[0] || 'S').toUpperCase()}
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat icon={Timer} label="Focus today" value={formatDuration(studySeconds)} hint="Actual sessions" />
          <Stat icon={CalendarDays} label="Tasks" value={`${completedToday}/${insights.tasksToday.length}`} hint="Completed today" />
          <Stat icon={Flame} label="Streak" value={`${streak}d`} hint="Current consistency" />
        </div>
      </div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2">
      <Link href="/dashboard/community" className="group rounded-2xl border border-violet-400/20 bg-violet-400/[0.045] p-5 transition hover:bg-violet-400/[0.08]">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/15"><Users className="h-5 w-5 text-violet-300" /></span><div><p className="font-semibold">Study Together</p><p className="text-xs text-muted-foreground">Join live rooms and focus with other students.</p></div><ArrowRight className="ml-auto h-4 w-4 text-violet-300 transition group-hover:translate-x-1" /></div>
      </Link>
      <Link href="/dashboard/pomodoro" className="group rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/[0.045] p-5 transition hover:bg-fuchsia-400/[0.08]">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-fuchsia-400/15"><Timer className="h-5 w-5 text-fuchsia-300" /></span><div><p className="font-semibold">Start Focus</p><p className="text-xs text-muted-foreground">25-minute Pomodoro with automatic session tracking.</p></div><ArrowRight className="ml-auto h-4 w-4 text-fuchsia-300 transition group-hover:translate-x-1" /></div>
      </Link>
    </section>

    <section>
      <div className="mb-3 flex items-center justify-between"><div><h2 className="text-base font-semibold">Today's mission</h2><p className="text-xs text-muted-foreground">Only the core work stays here.</p></div><Link href="/dashboard/planner" className="inline-flex items-center gap-1 text-xs text-primary">Open planner <ArrowRight className="h-3 w-3" /></Link></div>
      {pendingToday.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center"><Check className="mx-auto h-7 w-7 text-emerald-400" /><p className="mt-2 font-medium">Your planned tasks are complete.</p></div> : <div className="space-y-2">{pendingToday.map((t, index) => <button key={t.id} onClick={() => handleToggleTask(t)} disabled={busyTaskId === t.id} className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-left hover:bg-white/[0.06]"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.title}</p><div className="mt-1 text-[11px] text-muted-foreground">{t.subject || 'General study'}{t.startTime && t.endTime ? ` · ${t.startTime}–${t.endTime}` : ''}</div></div>{busyTaskId === t.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}</button>)}</div>}
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <Link href="/dashboard/mock-tests" className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"><div className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-primary" /><div><p className="font-semibold">Practice</p><p className="text-xs text-muted-foreground">Mock tests and exam preparation.</p></div></div></Link>
      <Link href="/dashboard/notes" className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"><div className="flex items-center gap-3"><NotebookPen className="h-5 w-5 text-primary" /><div><p className="font-semibold">Notes</p><p className="text-xs text-muted-foreground">Keep your learning knowledge in one place.</p></div></div></Link>
    </section>

    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Learning momentum</h2></div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.round(level.progress * 100)}%` }} /></div>
      <p className="mt-1.5 text-xs text-muted-foreground">Level {level.level} · {level.xpIntoLevel} XP into this level</p>
    </section>
  </div>;
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Timer; label: string; value: string; hint: string }) {
  return <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</div><div className="mt-2 text-xl font-semibold">{value}</div><div className="mt-1 text-[11px] text-muted-foreground">{hint}</div></div>;
}