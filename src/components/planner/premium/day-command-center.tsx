'use client';

import {
  Bell, Check, Clock3, Copy, Flame, MoreHorizontal, Pencil, Plus,
  RefreshCw, RotateCcw, SkipForward, Sparkles, Target, TimerReset,
  X, Zap
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { GlowCard } from '@/components/planner/premium/glow-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/firestore/planner-schema';

type Props = {
  tasks?: Task[];
  onToggle?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onNewTask?: () => void;
};

function toMinutes(value?: string | null) {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesBetween(start?: string | null, end?: string | null) {
  const a = toMinutes(start);
  const b = toMinutes(end);
  if (a === null || b === null || b <= a) return 0;
  return b - a;
}

function localToday() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function DayCommandCenter({ tasks = [], onToggle, onEdit, onNewTask }: Props) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [reminderOn, setReminderOn] = useState(true);
  const [reminderLead, setReminderLead] = useState('10');
  const [repeat, setRepeat] = useState('Does not repeat');

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = localToday();

  const todayTasks = useMemo(() => tasks
    .filter((task) => task.dueDate === today)
    .sort((a, b) => (toMinutes(a.startTime) ?? 9999) - (toMinutes(b.startTime) ?? 9999)), [tasks, today]);

  const completed = todayTasks.filter((task) => task.completed).length;
  const progress = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0;
  const nextAction = todayTasks.find((task) => !task.completed && (toMinutes(task.startTime) ?? 9999) >= currentMinutes) ?? todayTasks.find((task) => !task.completed);
  const plannedFocus = Math.round(todayTasks.reduce((sum, task) => sum + (task.subject ? minutesBetween(task.startTime, task.endTime) : 0), 0) / 60 * 10) / 10;
  const lifeScore = Math.min(100, Math.round(progress * 0.65 + Math.min(plannedFocus / 5, 1) * 35));
  const overdue = todayTasks.filter((task) => !task.completed && (toMinutes(task.endTime) ?? 9999) < currentMinutes).length;

  const openAdvanced = (task: Task) => {
    setSelectedTask(task);
    setAdvancedOpen(true);
    setReminderOn(Boolean(task.reminderAt));
  };

  return (
    <GlowCard className="overflow-hidden border-white/[0.08] bg-gradient-to-br from-white/[0.045] via-white/[0.025] to-primary/[0.08] p-0">
      {/* Life Command Bar */}
      <div className="border-b border-white/[0.07] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-4 w-4" /> Life OS · Today
            </div>
            <h2 className="text-xl font-bold sm:text-2xl">Your Day Command Center</h2>
            <p className="mt-1 text-sm text-muted-foreground">One intelligent timeline for everything that matters today.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="border-white/10 bg-white/[0.03]" onClick={() => window.alert('Day optimization will use your priorities and available time in the next planner engine update.') }>
              <RefreshCw className="h-4 w-4" /> Replan Day
            </Button>
            <Button size="sm" className="bg-gradient-brand" onClick={onNewTask}>
              <Plus className="h-4 w-4" /> Plan task
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['Life score', `${lifeScore}`, 'today'],
            ['Productivity', `${progress}%`, `${completed}/${todayTasks.length || 0} complete`],
            ['Planned focus', `${plannedFocus}h`, 'study blocks'],
            ['Streak', '🔥 7', 'days']
          ].map(([label, value, sub]) => (
            <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-bold">{value}</p>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next best action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-primary/[0.06] px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><Target className="h-4 w-4" /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Next best action</p>
            <p className="truncate text-sm font-semibold">{nextAction?.title || 'Plan your first focused block'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {overdue > 0 && <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold text-amber-300">{overdue} behind</span>}
          {nextAction && <Button size="sm" variant="outline" onClick={() => openAdvanced(nextAction)}><Zap className="h-4 w-4" /> Start</Button>}
        </div>
      </div>

      {/* Timeline */}
      <div className="divide-y divide-white/[0.05]">
        {todayTasks.length === 0 ? (
          <div className="p-8 text-center">
            <Clock3 className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 font-semibold">Your day is open</p>
            <p className="mt-1 text-sm text-muted-foreground">Create a timed task and it will appear here automatically.</p>
            <Button className="mt-4 bg-gradient-brand" onClick={onNewTask}><Plus className="h-4 w-4" /> Plan my day</Button>
          </div>
        ) : (
          todayTasks.map((task) => {
            const start = toMinutes(task.startTime);
            const end = toMinutes(task.endTime);
            const active = !task.completed && start !== null && start <= currentMinutes && (end === null || currentMinutes < end);
            const missed = !task.completed && end !== null && currentMinutes >= end;
            return (
              <div key={task.id} className={cn('group relative flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.025] sm:px-6', active && 'bg-primary/[0.07]')}>
                <button type="button" onClick={() => onToggle?.(task)} className={cn('h-5 w-5 shrink-0 rounded-full border transition-colors', task.completed ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300' : 'border-white/25 hover:border-primary')} aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}>
                  {task.completed && <Check className="h-3 w-3" />}
                </button>
                <div className="w-[68px] shrink-0 text-xs font-semibold text-muted-foreground sm:w-20">
                  <div>{task.startTime || 'Anytime'}</div>
                  {task.endTime && <div className="mt-0.5 text-[10px] opacity-60">to {task.endTime}</div>}
                </div>
                <div className={cn('h-10 w-1 shrink-0 rounded-full', task.completed ? 'bg-emerald-400' : active ? 'bg-primary shadow-[0_0_14px_hsl(var(--primary)/0.65)]' : missed ? 'bg-amber-400/60' : 'bg-white/15')} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn('truncate text-sm font-semibold', task.completed && 'text-muted-foreground line-through')}>{task.title}</p>
                    {active && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">NOW</span>}
                    {missed && <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">MISSED</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{task.subject || 'Personal'} · {task.priority} priority{task.reminderAt ? ' · 🔔' : ''}</p>
                </div>
                <div className="hidden items-center gap-1 sm:flex">
                  <button type="button" onClick={() => openAdvanced(task)} className="rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-white/5 hover:text-foreground group-hover:opacity-100" aria-label={`Advanced options for ${task.title}`}><MoreHorizontal className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onEdit?.(task)} className="rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-white/5 hover:text-foreground group-hover:opacity-100" aria-label={`Edit ${task.title}`}><Pencil className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Advanced task panel */}
      {advancedOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) setAdvancedOpen(false); }}>
          <div className="w-full max-w-xl overflow-hidden rounded-t-3xl border border-white/10 bg-[#15121f] shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between border-b border-white/[0.07] p-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Advanced controls</p>
                <h3 className="mt-1 text-lg font-bold">{selectedTask.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{selectedTask.startTime || 'Anytime'}{selectedTask.endTime ? ` — ${selectedTask.endTime}` : ''} · {selectedTask.priority} priority</p>
              </div>
              <button type="button" onClick={() => setAdvancedOpen(false)} className="rounded-xl p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2">
              <button type="button" onClick={() => onToggle?.(selectedTask)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left hover:bg-white/[0.06]"><Check className="h-4 w-4 text-emerald-300" /><span><b className="block text-sm">Done</b><small className="text-xs text-muted-foreground">Mark this block complete</small></span></button>
              <button type="button" onClick={() => { setAdvancedOpen(false); onEdit?.(selectedTask); }} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left hover:bg-white/[0.06]"><Pencil className="h-4 w-4 text-primary" /><span><b className="block text-sm">Edit block</b><small className="text-xs text-muted-foreground">Change time, priority or subject</small></span></button>
              <button type="button" onClick={() => window.alert('Snooze is ready for the notification layer; this keeps the current task unchanged until notifications are connected.')} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left hover:bg-white/[0.06]"><TimerReset className="h-4 w-4 text-amber-300" /><span><b className="block text-sm">Snooze</b><small className="text-xs text-muted-foreground">5 · 10 · 15 · 30 min</small></span></button>
              <button type="button" onClick={() => window.alert('Reschedule will move this block to the next suitable free slot once the scheduling engine is connected.')} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left hover:bg-white/[0.06]"><RotateCcw className="h-4 w-4 text-sky-300" /><span><b className="block text-sm">Reschedule</b><small className="text-xs text-muted-foreground">Find another time</small></span></button>
              <button type="button" onClick={() => window.alert('Duplicate action is queued for the task service integration.')} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left hover:bg-white/[0.06]"><Copy className="h-4 w-4 text-violet-300" /><span><b className="block text-sm">Duplicate</b><small className="text-xs text-muted-foreground">Create another block</small></span></button>
              <button type="button" onClick={() => window.alert('Skip action is queued for the task service integration.')} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left hover:bg-white/[0.06]"><SkipForward className="h-4 w-4 text-rose-300" /><span><b className="block text-sm">Skip</b><small className="text-xs text-muted-foreground">Remove from today's plan</small></span></button>
            </div>

            <div className="mx-5 mb-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-amber-300" /><span className="text-sm font-semibold">Advanced reminder</span></div>
                <button type="button" onClick={() => setReminderOn((v) => !v)} className={cn('h-6 w-11 rounded-full p-1 transition-colors', reminderOn ? 'bg-primary' : 'bg-white/10')}><span className={cn('block h-4 w-4 rounded-full bg-white transition-transform', reminderOn && 'translate-x-5')} /></button>
              </div>
              {reminderOn && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs text-muted-foreground">Notify
                    <select value={reminderLead} onChange={(e) => setReminderLead(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-foreground outline-none"><option value="0">At start</option><option value="5">5 min before</option><option value="10">10 min before</option><option value="15">15 min before</option><option value="30">30 min before</option></select>
                  </label>
                  <label className="text-xs text-muted-foreground">Repeat
                    <select value={repeat} onChange={(e) => setRepeat(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-foreground outline-none"><option>Does not repeat</option><option>Daily</option><option>Weekdays</option><option>Weekly</option><option>Custom</option></select>
                  </label>
                </div>
              )}
              <p className="mt-3 text-[10px] text-muted-foreground">Reminder preferences are staged here; browser notification persistence will be wired to the planner reminder service.</p>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/[0.07] p-4">
              <Button variant="ghost" onClick={() => setAdvancedOpen(false)}>Close</Button>
              <Button className="bg-gradient-brand" onClick={() => setAdvancedOpen(false)}><Check className="h-4 w-4" /> Save preferences</Button>
            </div>
          </div>
        </div>
      )}
    </GlowCard>
  );
}
