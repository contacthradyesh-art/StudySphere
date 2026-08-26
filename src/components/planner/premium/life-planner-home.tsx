'use client';

import Link from 'next/link';
import { CalendarDays, Check, Clock3, Flame, Play, Sparkles, Target, Timer, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { GlowCard } from '@/components/planner/premium/glow-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/firestore/planner-schema';
import type { PomodoroSession } from '@/lib/firestore/pomodoro-schema';

type Props = {
  tasks: Task[];
  sessions: PomodoroSession[];
  userName?: string | null;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onNewTask: () => void;
};

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function minutes(value?: string | null) {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function duration(task: Task) {
  const start = minutes(task.startTime);
  const end = minutes(task.endTime);
  return start !== null && end !== null && end > start ? end - start : 0;
}

function dateKey(value: unknown) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  return null;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function LifePlannerHome({ tasks, sessions, userName, onToggle, onEdit, onNewTask }: Props) {
  const today = localToday();
  const todayTasks = useMemo(() => tasks.filter((task) => task.dueDate === today).sort((a, b) => (minutes(a.startTime) ?? 9999) - (minutes(b.startTime) ?? 9999)), [tasks, today]);
  const completed = todayTasks.filter((task) => task.completed);
  const plannedMinutes = todayTasks.reduce((sum, task) => sum + duration(task), 0);
  const completedPlannedMinutes = completed.reduce((sum, task) => sum + duration(task), 0);
  const todaySessions = sessions.filter((session) => session.phase === 'focus' && dateKey(session.startedAt) === today);
  const actualFocusSeconds = todaySessions.reduce((sum, session) => sum + Math.max(0, session.completedSeconds || 0), 0);
  const actualFocusMinutes = Math.round(actualFocusSeconds / 60);
  const completion = todayTasks.length ? Math.round((completed.length / todayTasks.length) * 100) : 0;
  const next = todayTasks.find((task) => !task.completed) ?? null;
  const overdue = todayTasks.filter((task) => !task.completed && (minutes(task.endTime) ?? 9999) < new Date().getHours() * 60 + new Date().getMinutes()).length;

  const focusDays = useMemo(() => {
    const keys = new Set(sessions.filter((session) => session.phase === 'focus' && session.completedSeconds > 0).map((session) => dateKey(session.startedAt)).filter(Boolean));
    let streak = 0;
    const cursor = new Date();
    while (keys.has(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [sessions]);

  const insight = useMemo(() => {
    if (!todayTasks.length) return 'Your plan is empty. Add one realistic study block and build from there.';
    if (overdue > 0) return `${overdue} task${overdue > 1 ? 's are' : ' is'} behind. Protect the next priority block instead of overloading the rest of the day.`;
    if (plannedMinutes > 300 && actualFocusMinutes < plannedMinutes * 0.5) return 'Your plan is ambitious today. Start one focused block before adding more work.';
    if (completion >= 80) return 'You are on track. Finish the next priority block, then keep some time for revision.';
    return 'Keep the next block small and specific. Consistency matters more than filling every hour.';
  }, [todayTasks.length, overdue, plannedMinutes, actualFocusMinutes, completion]);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-white/[0.025] to-primary/[0.07] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Life OS · Today</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">{greeting()}, {userName || 'Student'}.</h2>
            <p className="mt-1 text-sm text-muted-foreground">Plan → Schedule → Focus → Track → Improve.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/pomodoro"><Button variant="outline" className="border-white/10"><Timer className="h-4 w-4" /> Focus</Button></Link>
            <Button className="bg-gradient-brand" onClick={onNewTask}><Sparkles className="h-4 w-4" /> Plan task</Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-5">
          <Metric label="Day progress" value={`${completion}%`} sub={`${completed.length}/${todayTasks.length} tasks`} />
          <Metric label="Planned" value={formatMinutes(plannedMinutes)} sub="today" />
          <Metric label="Completed" value={formatMinutes(completedPlannedMinutes)} sub="planned time" />
          <Metric label="Focus" value={formatMinutes(actualFocusMinutes)} sub="actual sessions" />
          <Metric label="Streak" value={focusDays ? `${focusDays}d` : '—'} sub={focusDays ? 'focus days' : 'start a session'} icon={<Flame className="h-3.5 w-3.5" />} />
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]" aria-label={`Today's progress ${completion}%`}><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} /></div>
      </section>

      <section className="rounded-2xl border border-primary/15 bg-primary/[0.05] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><Target className="h-5 w-5" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Next best action</p><p className="truncate text-sm font-bold">{next?.title || 'Create your first focused block'}</p>{next && <p className="text-xs text-muted-foreground">{next.subject || 'Personal'} · {next.priority} priority · {duration(next) || 0} min</p>}</div></div>
          {next ? <Link href="/dashboard/pomodoro"><Button size="sm"><Play className="h-4 w-4" /> Start Focus</Button></Link> : <Button size="sm" onClick={onNewTask}><Zap className="h-4 w-4" /> Plan now</Button>}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-white/[0.07] p-4 sm:p-5"><div><h3 className="font-bold">Today&apos;s Mission</h3><p className="text-xs text-muted-foreground">Only the work that matters today.</p></div><CalendarDays className="h-5 w-5 text-muted-foreground" /></div>
        {todayTasks.length ? todayTasks.map((task) => {
          const active = task.startTime && task.endTime ? (() => { const now = new Date().getHours() * 60 + new Date().getMinutes(); const s = minutes(task.startTime)!; const e = minutes(task.endTime)!; return !task.completed && now >= s && now < e; })() : false;
          return <div key={task.id} className={cn('flex items-center gap-3 border-b border-white/[0.05] p-4 last:border-0', active && 'bg-primary/[0.06]')}>
            <button type="button" onClick={() => onToggle(task)} className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', task.completed ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300' : 'border-white/20')} aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}>{task.completed && <Check className="h-3.5 w-3.5" />}</button>
            <div className="w-16 shrink-0 text-xs font-semibold text-muted-foreground">{task.startTime || 'Anytime'}</div>
            <div className={cn('h-9 w-1 rounded-full', task.completed ? 'bg-emerald-400' : active ? 'bg-primary' : task.priority === 'high' ? 'bg-amber-400/70' : 'bg-white/15')} />
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className={cn('truncate text-sm font-semibold', task.completed && 'line-through text-muted-foreground')}>{task.title}</p>{active && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">NOW</span>}</div><p className="text-xs text-muted-foreground">{task.subject || 'Personal'} · {duration(task) || 'Flexible'} min · {task.priority}</p></div>
            <button type="button" onClick={() => onEdit(task)} className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/[0.06] hover:text-foreground">Edit</button>
          </div>;
        }) : <div className="p-8 text-center"><Clock3 className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 font-semibold">No plan for today</p><p className="mt-1 text-sm text-muted-foreground">Start with one realistic block instead of planning the whole day at once.</p><Button className="mt-4 bg-gradient-brand" onClick={onNewTask}>Add first task</Button></div>}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlowCard><div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 text-primary" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Planner Intelligence</p><h3 className="mt-1 font-bold">A suggestion based on your real data</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{insight}</p></div></div></GlowCard>
        <GlowCard><div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-5 w-5 text-sky-300" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300">Plan vs actual</p><h3 className="mt-1 font-bold">{formatMinutes(plannedMinutes)} planned · {formatMinutes(actualFocusMinutes)} focused</h3><p className="mt-2 text-sm text-muted-foreground">Focus time comes from completed Pomodoro sessions. No placeholder hours are shown.</p></div></div></GlowCard>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, icon }: { label: string; value: string; sub: string; icon?: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-3"><p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{icon}{label}</p><p className="mt-1 text-lg font-black">{value}</p><p className="text-[10px] text-muted-foreground">{sub}</p></div>;
}

function formatMinutes(value: number) {
  if (value <= 0) return '0m';
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}
