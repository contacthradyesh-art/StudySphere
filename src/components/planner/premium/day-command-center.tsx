'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  BellRing,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  ListPlus,
  Plus,
  Sparkles,
  Target,
  Timer,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowCard } from './glow-card';
import type { Task } from '@/lib/firestore/planner-schema';
import { cn } from '@/lib/utils';

interface DayCommandCenterProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onNewTask: () => void;
}

const DAY_START = 6;
const DAY_END = 24;
const HOUR_HEIGHT = 74;

function isoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseMinutes(value?: string | null) {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(date);
}

function priorityClass(priority: Task['priority']) {
  if (priority === 'high') return 'border-rose-400/25 bg-rose-400/10 text-rose-300';
  if (priority === 'medium') return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
  return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
}

export function DayCommandCenter({ tasks, onToggle, onEdit, onNewTask }: DayCommandCenterProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [notificationState, setNotificationState] = useState<NotificationPermission | 'unsupported'>('default');
  const selectedIso = isoDate(selectedDate);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) {
      setNotificationState('unsupported');
      return;
    }
    setNotificationState(Notification.permission);
  }, []);

  // Browser reminders are intentionally opt-in. Persistent background push needs a service worker.
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;
      const now = Date.now();
      const sent = JSON.parse(sessionStorage.getItem('studysphere-reminders') || '{}') as Record<string, number>;

      for (const task of tasks) {
        if (!task.reminderAt || task.completed) continue;
        if (Math.abs(now - task.reminderAt) > 45_000) continue;
        if (sent[task.id]) continue;

        try {
          new Notification('StudySphere reminder', {
            body: task.title,
            tag: `task-${task.id}`,
          });
          sent[task.id] = now;
        } catch {
          // Notification constructors can be restricted by the browser/device.
        }
      }

      sessionStorage.setItem('studysphere-reminders', JSON.stringify(sent));
    };

    checkReminders();
    const id = window.setInterval(checkReminders, 30_000);
    return () => window.clearInterval(id);
  }, [tasks]);

  async function enableNotifications() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationState(permission);
  }

  const dayTasks = useMemo(
    () => tasks.filter((task) => task.dueDate === selectedIso).sort((a, b) => {
      const aStart = parseMinutes(a.startTime) ?? 24 * 60;
      const bStart = parseMinutes(b.startTime) ?? 24 * 60;
      return aStart - bStart;
    }),
    [tasks, selectedIso]
  );

  const scheduled = dayTasks.filter((task) => parseMinutes(task.startTime) !== null);
  const unscheduled = dayTasks.filter((task) => parseMinutes(task.startTime) === null);
  const done = dayTasks.filter((task) => task.completed).length;
  const completion = dayTasks.length ? Math.round((done / dayTasks.length) * 100) : 0;
  const focusMinutes = scheduled.reduce((total, task) => {
    const start = parseMinutes(task.startTime);
    const end = parseMinutes(task.endTime);
    return start !== null && end !== null && end > start ? total + (end - start) : total;
  }, 0);

  const todayIso = isoDate(new Date());
  const isToday = selectedIso === todayIso;
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const currentTop = (currentMinutes - DAY_START * 60) * (HOUR_HEIGHT / 60);
  const showNow = isToday && currentMinutes >= DAY_START * 60 && currentMinutes <= DAY_END * 60;

  function shiftDay(amount: number) {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + amount);
      return next;
    });
  }

  function jumpToday() {
    setSelectedDate(new Date());
  }

  return (
    <section className="space-y-4">
      <GlowCard accent="#8b5cf6" className="relative overflow-hidden p-0">
        <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative p-5 md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-300">
                  <Sparkles className="h-3 w-3" /> Day Command Center
                </span>
                <span className="text-xs text-muted-foreground">Plan • Focus • Execute • Review</span>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <h2 className="text-2xl font-black tracking-tight md:text-3xl">{isToday ? 'Your day, designed.' : formatDayLabel(selectedDate)}</h2>
                <span className="mb-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-muted-foreground">
                  {completion}% complete
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                One calm timeline for everything important. Scheduled work stays visible; unscheduled tasks wait below so they never disappear.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => shiftDay(-1)} aria-label="Previous day">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={jumpToday}>
                <CalendarDays className="h-4 w-4" /> Today
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => shiftDay(1)} aria-label="Next day">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button type="button" variant="gradient" size="sm" onClick={onNewTask}>
                <Plus className="h-4 w-4" /> Plan block
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniMetric icon={Target} label="Today's mission" value={`${done}/${dayTasks.length}`} hint="tasks completed" />
            <MiniMetric icon={Timer} label="Planned focus" value={formatDuration(focusMinutes)} hint="scheduled time" />
            <MiniMetric icon={Flame} label="Momentum" value={completion >= 80 ? 'Strong' : completion >= 50 ? 'Building' : 'Start small'} hint="execution state" />
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reminders</p>
                  <p className="mt-1 text-sm font-bold">
                    {notificationState === 'granted' ? 'Enabled' : notificationState === 'unsupported' ? 'Unavailable' : 'Off'}
                  </p>
                </div>
                {notificationState === 'granted' ? (
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-300"><BellRing className="h-4 w-4" /></span>
                ) : (
                  <button
                    type="button"
                    onClick={enableNotifications}
                    disabled={notificationState === 'unsupported' || notificationState === 'denied'}
                    className="rounded-xl border border-violet-400/20 bg-violet-400/10 px-2.5 py-2 text-xs font-semibold text-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Bell className="mr-1 inline h-3.5 w-3.5" /> Enable
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3 md:px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-violet-300" />
            <span><strong className="text-foreground">P1</strong> = must do</span>
            <span className="text-white/20">•</span>
            <span><strong className="text-foreground">P2</strong> = important</span>
            <span className="text-white/20">•</span>
            <span><strong className="text-foreground">P3</strong> = optional</span>
            <span className="text-white/20">•</span>
            <span>Drag-free, simple timeline — edit any block to change its time.</span>
          </div>
        </div>
      </GlowCard>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <GlowCard className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-5">
            <div>
              <p className="text-sm font-bold">Daily timeline</p>
              <p className="text-xs text-muted-foreground">06:00 — 00:00 • your planned flow</p>
            </div>
            <div className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              {scheduled.length} scheduled
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="relative min-w-[680px]" style={{ height: (DAY_END - DAY_START) * HOUR_HEIGHT + 32 }}>
              {Array.from({ length: DAY_END - DAY_START + 1 }, (_, index) => {
                const hour = DAY_START + index;
                return (
                  <div key={hour} className="absolute inset-x-0 flex items-start" style={{ top: index * HOUR_HEIGHT }}>
                    <div className="w-16 shrink-0 px-3 text-right text-[10px] font-semibold text-muted-foreground/70">
                      {String(hour).padStart(2, '0')}:00
                    </div>
                    <div className="h-px flex-1 bg-white/[0.07]" />
                  </div>
                );
              })}

              {showNow && (
                <div className="pointer-events-none absolute left-16 right-4 z-20 flex items-center" style={{ top: currentTop }}>
                  <span className="mr-2 h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(139,92,246,0.8)]" />
                  <div className="h-px flex-1 bg-violet-400/70" />
                  <span className="ml-2 rounded-full bg-violet-500/15 px-2 py-0.5 text-[9px] font-bold text-violet-300">NOW</span>
                </div>
              )}

              {scheduled.map((task) => {
                const start = parseMinutes(task.startTime)!;
                const end = parseMinutes(task.endTime) ?? start + 45;
                const top = (start - DAY_START * 60) * (HOUR_HEIGHT / 60) + 5;
                const height = Math.max(42, (end - start) * (HOUR_HEIGHT / 60) - 8);
                return (
                  <motion.button
                    key={task.id}
                    type="button"
                    whileHover={{ y: -1 }}
                    onClick={() => onEdit(task)}
                    className={cn(
                      'absolute left-20 right-4 overflow-hidden rounded-2xl border p-3 text-left shadow-lg transition-all hover:border-violet-400/30 hover:bg-white/[0.07]',
                      task.completed ? 'border-emerald-400/20 bg-emerald-400/[0.07]' : 'border-white/10 bg-white/[0.045]'
                    )}
                    style={{ top, height }}
                  >
                    <div className="flex h-full gap-3">
                      <div className={cn('mt-0.5 h-full w-1 rounded-full', task.completed ? 'bg-emerald-400/70' : task.priority === 'high' ? 'bg-rose-400/80' : 'bg-violet-400/70')} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn('truncate text-sm font-bold', task.completed && 'text-muted-foreground line-through')}>{task.title}</p>
                          <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">{task.startTime}{task.endTime ? `–${task.endTime}` : ''}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className={cn('rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase', priorityClass(task.priority))}>{task.priority}</span>
                          {task.subject && <span className="rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-muted-foreground">{task.subject}</span>}
                          {task.reminderAt && <BellRing className="h-3 w-3 text-violet-300" />}
                        </div>
                        {height > 70 && <p className="mt-2 text-[10px] text-muted-foreground">Click to edit • reminder + time controls</p>}
                      </div>
                    </div>
                  </motion.button>
                );
              })}

              {scheduled.length === 0 && (
                <div className="absolute inset-0 grid place-items-center p-8 text-center">
                  <div className="max-w-sm">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-400/10 text-violet-300"><Clock3 className="h-5 w-5" /></div>
                    <p className="mt-3 text-sm font-bold">Your timeline is ready.</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Add a time to your important tasks and the whole day will turn into a clear visual plan.</p>
                    <Button type="button" variant="gradient" size="sm" className="mt-4" onClick={onNewTask}><Plus className="h-4 w-4" /> Add first block</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </GlowCard>

        <GlowCard className="h-fit p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Unscheduled</p>
              <p className="text-xs text-muted-foreground">Give these a time.</p>
            </div>
            <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] font-bold">{unscheduled.length}</span>
          </div>

          <div className="mt-4 space-y-2.5">
            {unscheduled.slice(0, 7).map((task) => (
              <div key={task.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => onToggle(task)}
                    className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border', task.completed ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300' : 'border-white/15 hover:border-violet-400/40')}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed && <Check className="h-3 w-3" />}
                  </button>
                  <button type="button" onClick={() => onEdit(task)} className="min-w-0 flex-1 text-left">
                    <p className={cn('truncate text-xs font-semibold', task.completed && 'text-muted-foreground line-through')}>{task.title}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={cn('rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase', priorityClass(task.priority))}>{task.priority}</span>
                      {task.reminderAt && <BellRing className="h-3 w-3 text-violet-300" />}
                    </div>
                  </button>
                </div>
              </div>
            ))}

            {unscheduled.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 p-4 text-center">
                <Check className="mx-auto h-4 w-4 text-emerald-300" />
                <p className="mt-2 text-xs font-semibold">Everything has a place.</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Beautiful. Now execute.</p>
              </div>
            )}
          </div>

          <button type="button" onClick={onNewTask} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-violet-400/30 hover:text-foreground">
            <ListPlus className="h-3.5 w-3.5" /> Add task to this day
          </button>
        </GlowCard>
      </div>
    </section>
  );
}

function MiniMetric({ icon: Icon, label, value, hint }: { icon: typeof Target; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-lg font-black tracking-tight">{value}</p>
          <p className="text-[10px] text-muted-foreground">{hint}</p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Icon className="h-4 w-4" /></span>
      </div>
    </div>
  );
}

function formatDuration(minutes: number) {
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}
