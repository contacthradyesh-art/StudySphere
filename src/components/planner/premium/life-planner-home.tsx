'use client';

import Link from 'next/link';
import { CalendarDays, Check, ChevronRight, Clock3, Flame, Play, Sparkles, Target, Timer, Zap } from 'lucide-react';
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

function formatMinutes(value: number) {
  if (value <= 0) return '0m';
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

export function LifePlannerHome({ tasks, sessions, userName, onToggle, onEdit, onNewTask }: Props) {
  const today = localToday();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.dueDate === today).sort((a, b) => (minutes(a.startTime) ?? 9999) - (minutes(b.startTime) ?? 9999)),
    [tasks, today]
  );

  const completed = todayTasks.filter((task) => task.completed);
  const remainingTasks = todayTasks.filter((task) => !task.completed);
  const plannedMinutes = todayTasks.reduce((sum, task) => sum + duration(task), 0);
  const completedPlannedMinutes = completed.reduce((sum, task) => sum + duration(task), 0);
  const remainingPlannedMinutes = Math.max(0, plannedMinutes - completedPlannedMinutes);
  const todaySessions = sessions.filter((session) => session.phase === 'focus' && dateKey(session.startedAt) === today);
  const actualFocusMinutes = Math.round(todaySessions.reduce((sum, session) => sum + Math.max(0, session.completedSeconds || 0), 0) / 60);
  const completion = todayTasks.length ? Math.round((completed.length / todayTasks.length) * 100) : 0;
  const timeCompletion = plannedMinutes ? Math.min(100, Math.round((actualFocusMinutes / plannedMinutes) * 100)) : 0;
  const dayScore = todayTasks.length ? Math.round(completion * 0.7 + timeCompletion * 0.3) : 0;

  const next = useMemo(
    () => remainingTasks.find((task) => {
      const start = minutes(task.startTime);
      return start === null || start >= nowMinutes;
    }) ?? remainingTasks[0] ?? null,
    [remainingTasks, nowMinutes]
  );

  const activeTask = useMemo(
    () => remainingTasks.find((task) => {
      const start = minutes(task.startTime);
      const end = minutes(task.endTime);
      return start !== null && end !== null && nowMinutes >= start && nowMinutes < end;
    }) ?? null,
    [remainingTasks, nowMinutes]
  );

  const overdue = remainingTasks.filter((task) => {
    const end = minutes(task.endTime);
    return end !== null && end < nowMinutes;
  });

  const focusDays = useMemo(() => {
    const keys = new Set(
      sessions
        .filter((session) => session.phase === 'focus' && session.completedSeconds > 0)
        .map((session) => dateKey(session.startedAt))
        .filter(Boolean)
    );
    let streak = 0;
    const cursor = new Date();
    while (keys.has(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [sessions]);

  const insight = useMemo(() => {
    if (!todayTasks.length) return 'Start with one focused block. Your planner will build a useful history from real activity.';
    if (overdue.length) return `${overdue.length} task${overdue.length > 1 ? 's are' : ' is'} behind. Protect the next priority block instead of overloading the rest of the day.`;
    if (plannedMinutes > 300 && actualFocusMinutes < plannedMinutes * 0.5) return 'Today is ambitious. Start the next focused block before adding more work.';
    if (completion >= 80) return 'You are on track. Finish the next priority block and leave room for revision.';
    return 'Keep the next block specific and realistic. Consistency beats filling every hour.';
  }, [todayTasks.length, overdue.length, plannedMinutes, actualFocusMinutes, completion]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-white/[0.065] via-white/[0.025] to-primary/[0.09] p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Life OS · Today</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{greeting()}, {userName || 'Student'}.</h2>
              <p className="mt-1 text-sm text-muted-foreground">One clear plan for what matters today.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/dashboard/pomodoro">
                <Button variant="outline" size="icon" className="border-white/10" aria-label="Open focus"><Timer className="h-4 w-4" /></Button>
              </Link>
              <Button size="icon" className="bg-gradient-brand" onClick={onNewTask} aria-label="Add task"><Zap className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Metric label="Day score" value={`${dayScore}%`} sub={dayScore ? 'derived from progress' : 'start your day'} />
            <Metric label="Tasks" value={`${completed.length}/${todayTasks.length}`} sub="completed" icon={<Check className="h-3.5 w-3.5" />} />
            <Metric label="Planned" value={formatMinutes(plannedMinutes)} sub="scheduled today" icon={<CalendarDays className="h-3.5 w-3.5" />} />
            <Metric label="Focus" value={formatMinutes(actualFocusMinutes)} sub="actual time" icon={<Clock3 className="h-3.5 w-3.5" />} />
            <Metric label="Streak" value={focusDays ? `${focusDays}d` : '—'} sub={focusDays ? 'focus days' : 'start a session'} icon={<Flame className="h-3.5 w-3.5" />} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold">Today&apos;s progress</span>
              <span className="text-muted-foreground">{completion}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${completion}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{formatMinutes(completedPlannedMinutes)} completed</span>
              <span>{formatMinutes(remainingPlannedMinutes)} remaining</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-primary/15 bg-primary/[0.055] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><Target className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-primary">{activeTask ? 'Happening now' : 'Next best action'}</p>
              <p className="truncate text-sm font-bold">{activeTask?.title || next?.title || 'Create your first focused block'}</p>
              {next && <p className="truncate text-xs text-muted-foreground">{next.subject || 'Personal'} · {next.priority} priority · {duration(next) || 'Flexible'} min</p>}
            </div>
          </div>
          {next ? (
            <Link href="/dashboard/pomodoro" className="shrink-0">
              <Button size="sm" className="w-full sm:w-auto"><Play className="h-4 w-4" /> Start Focus</Button>
            </Link>
          ) : (
            <Button size="sm" onClick={onNewTask} className="w-full sm:w-auto"><Zap className="h-4 w-4" /> Plan now</Button>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-white/[0.07] p-4 sm:p-5">
          <div><h3 className="font-bold">Today&apos;s Mission</h3><p className="text-xs text-muted-foreground">Your schedule, in priority order.</p></div>
          <Link href="/dashboard/planner" className="flex items-center gap-1 text-xs font-semibold text-primary">Planner <ChevronRight className="h-3.5 w-3.5" /></Link>
        </div>
        {todayTasks.length ? todayTasks.map((task) => {
          const start = minutes(task.startTime);
          const end = minutes(task.endTime);
          const active = !task.completed && start !== null && end !== null && nowMinutes >= start && nowMinutes < end;
          const late = !task.completed && end !== null && end < nowMinutes;
          return (
            <div key={task.id} className={cn('flex items-center gap-3 border-b border-white/[0.05] p-4 last:border-0', active && 'bg-primary/[0.065]', late && 'bg-amber-400/[0.035]')}>
              <button type="button" onClick={() => onToggle(task)} className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition', task.completed ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300' : 'border-white/20 hover:border-primary')} aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}>{task.completed && <Check className="h-3.5 w-3.5" />}</button>
              <div className="w-14 shrink-0 text-xs font-semibold text-muted-foreground sm:w-16">{task.startTime || 'Anytime'}</div>
              <div className={cn('h-9 w-1 shrink-0 rounded-full', task.completed ? 'bg-emerald-400' : active ? 'bg-primary' : late ? 'bg-amber-400' : task.priority === 'high' ? 'bg-amber-400/70' : 'bg-white/15')} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className={cn('truncate text-sm font-semibold', task.completed && 'line-through text-muted-foreground')}>{task.title}</p>{active && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">NOW</span>}{late && <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">BEHIND</span>}</div>
                <p className="truncate text-xs text-muted-foreground">{task.subject || 'Personal'} · {duration(task) || 'Flexible'} min · {task.priority}</p>
              </div>
              <button type="button" onClick={() => onEdit(task)} className="shrink-0 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/[0.06] hover:text-foreground">Edit</button>
            </div>
          );
        }) : (
          <div className="p-8 text-center sm:p-10">
            <Clock3 className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 font-semibold">No plan for today</p>
            <p className="mt-1 text-sm text-muted-foreground">Add one realistic study block and build from there.</p>
            <Button className="mt-4 bg-gradient-brand" onClick={onNewTask}>Add first task</Button>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlowCard>
          <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Planner Intelligence</p><h3 className="mt-1 font-bold">One useful suggestion</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{insight}</p></div></div>
        </GlowCard>
        <GlowCard>
          <div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300">Plan vs actual</p><h3 className="mt-1 font-bold">{formatMinutes(plannedMinutes)} planned · {formatMinutes(actualFocusMinutes)} focused</h3><p className="mt-2 text-sm text-muted-foreground">Actual focus comes only from completed Pomodoro sessions.</p></div></div>
        </GlowCard>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, icon }: { label: string; value: string; sub: string; icon?: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-3"><p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{icon}{label}</p><p className="mt-1 text-lg font-black">{value}</p><p className="text-[10px] text-muted-foreground">{sub}</p></div>;
}
