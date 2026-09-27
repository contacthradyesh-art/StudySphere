'use client';

import { useMemo, useState } from 'react';
import { Check, Clock3, Pencil, Plus, Sparkles, Target, X, Zap } from 'lucide-react';
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
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function durationMinutes(task: Task) {
  const start = toMinutes(task.startTime);
  const end = toMinutes(task.endTime);
  return start !== null && end !== null && end > start ? end - start : 0;
}

function priorityWeight(priority: Task['priority']) {
  return priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;
}

export function DayCommandCenter({ tasks = [], onToggle, onEdit, onNewTask }: Props) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const today = localToday();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayTasks = useMemo(() => tasks
    .filter((task) => task.dueDate === today)
    .sort((a, b) => (toMinutes(a.startTime) ?? 9999) - (toMinutes(b.startTime) ?? 9999)), [tasks, today]);

  const completed = todayTasks.filter((task) => task.completed).length;
  const progress = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0;
  const plannedMinutes = todayTasks.reduce((sum, task) => sum + durationMinutes(task), 0);
  const overdue = todayTasks.filter((task) => !task.completed && (toMinutes(task.endTime) ?? 9999) < currentMinutes).length;

  // Deterministic next-action selection: active/overdue first, then priority, then nearest start.
  const nextAction = useMemo(() => {
    const pending = todayTasks.filter((task) => !task.completed);
    return [...pending].sort((a, b) => {
      const aStart = toMinutes(a.startTime);
      const bStart = toMinutes(b.startTime);
      const aActive = aStart !== null && aStart <= currentMinutes && (toMinutes(a.endTime) === null || currentMinutes < (toMinutes(a.endTime) as number));
      const bActive = bStart !== null && bStart <= currentMinutes && (toMinutes(b.endTime) === null || currentMinutes < (toMinutes(b.endTime) as number));
      if (aActive !== bActive) return aActive ? -1 : 1;
      const aMissed = (toMinutes(a.endTime) ?? 9999) < currentMinutes;
      const bMissed = (toMinutes(b.endTime) ?? 9999) < currentMinutes;
      if (aMissed !== bMissed) return aMissed ? -1 : 1;
      const priorityDiff = priorityWeight(b.priority) - priorityWeight(a.priority);
      if (priorityDiff) return priorityDiff;
      return (aStart ?? 9999) - (bStart ?? 9999);
    })[0];
  }, [todayTasks, currentMinutes]);

  const active = nextAction && !nextAction.completed && (toMinutes(nextAction.startTime) ?? 9999) <= currentMinutes && (toMinutes(nextAction.endTime) === null || currentMinutes < (toMinutes(nextAction.endTime) as number));
  const whyNow = active ? 'This block is active right now.' : nextAction?.goalId ? 'Connected to an active goal.' : nextAction?.priority === 'high' ? 'High priority needs attention.' : 'It is the next available action in your plan.';

  return (
    <div className="space-y-4">
      <GlowCard className="overflow-hidden border-white/[0.08] bg-gradient-to-br from-white/[0.045] via-white/[0.025] to-primary/[0.08] p-0">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Sparkles className="h-4 w-4" /> Life Execution · Today</div>
              <h2 className="text-xl font-bold sm:text-2xl">What matters right now?</h2>
              <p className="mt-1 text-sm text-muted-foreground">One primary action, then the rest of your day.</p>
            </div>
            <Button size="sm" variant="outline" className="border-white/10 bg-white/[0.03]" onClick={onNewTask}><Plus className="h-4 w-4" /> Plan task</Button>
          </div>

          <div className="mt-5 rounded-3xl border border-primary/20 bg-primary/[0.07] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Zap className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Do this now · Next best action</p>
                <h3 className="mt-1 text-lg font-bold sm:text-xl">{nextAction?.title || 'Build your day'}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{nextAction ? whyNow : 'Your day is open. Add one focused block instead of planning everything at once.'}</p>
                {nextAction && <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white/[0.06] px-2.5 py-1">{nextAction.startTime || 'Anytime'}{nextAction.endTime ? `–${nextAction.endTime}` : ''}</span><span className="rounded-full bg-white/[0.06] px-2.5 py-1">{nextAction.priority} priority</span>{nextAction.goalId && <span className="rounded-full bg-white/[0.06] px-2.5 py-1">Goal linked</span>}</div>}
              </div>
              {nextAction && <Button className="shrink-0 bg-gradient-brand" onClick={() => setSelectedTask(nextAction)}><Zap className="h-4 w-4" /> Start focus</Button>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Missions" value={`${completed}/${todayTasks.length}`} sub="completed" />
            <Stat label="Focus" value={`${Math.floor(plannedMinutes / 60)}h ${plannedMinutes % 60}m`} sub="planned" />
            <Stat label="Completion" value={`${progress}%`} sub="today" />
            <Stat label="Attention" value={`${overdue}`} sub="delayed" />
          </div>
        </div>

        <div className="border-y border-white/[0.06] px-5 py-4 sm:px-6">
          <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold">Today's execution</span><span className="text-muted-foreground">{progress}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} /></div>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {todayTasks.length === 0 ? <div className="p-8 text-center"><Clock3 className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 font-semibold">Your day is open.</p><p className="mt-1 text-sm text-muted-foreground">Build one focused block to get moving.</p><Button className="mt-4 bg-gradient-brand" onClick={onNewTask}><Plus className="h-4 w-4" /> Build my day</Button></div> : todayTasks.map((task) => {
            const start = toMinutes(task.startTime);
            const end = toMinutes(task.endTime);
            const isActive = !task.completed && start !== null && start <= currentMinutes && (end === null || currentMinutes < end);
            const missed = !task.completed && end !== null && currentMinutes >= end;
            return <div key={task.id} className={cn('flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.025] sm:px-6', isActive && 'bg-primary/[0.07]')}>
              <button type="button" onClick={() => onToggle?.(task)} className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', task.completed ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300' : 'border-white/25 hover:border-primary')} aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}>{task.completed && <Check className="h-3 w-3" />}</button>
              <div className="w-16 shrink-0 text-xs font-semibold text-muted-foreground sm:w-20"><div>{task.startTime || 'Anytime'}</div>{task.endTime && <div className="text-[10px] opacity-60">to {task.endTime}</div>}</div>
              <div className={cn('h-9 w-1 shrink-0 rounded-full', task.completed ? 'bg-emerald-400' : isActive ? 'bg-primary' : missed ? 'bg-amber-400/70' : 'bg-white/15')} />
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className={cn('truncate text-sm font-semibold', task.completed && 'text-muted-foreground line-through')}>{task.title}</p>{isActive && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">NOW</span>}{missed && <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">DELAYED</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{task.subject || 'Personal'} · {task.priority} priority</p></div>
              <button type="button" onClick={() => setSelectedTask(task)} className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground" aria-label={`Open ${task.title}`}><Pencil className="h-4 w-4" /></button>
            </div>;
          })}
        </div>
      </GlowCard>

      {selectedTask && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTask(null); }}>
        <div className="w-full max-w-lg rounded-t-3xl border border-white/10 bg-[#15121f] p-5 shadow-2xl sm:rounded-3xl">
          <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Next action</p><h3 className="mt-1 text-lg font-bold">{selectedTask.title}</h3><p className="mt-1 text-xs text-muted-foreground">{selectedTask.startTime || 'Anytime'}{selectedTask.endTime ? ` — ${selectedTask.endTime}` : ''} · {selectedTask.priority} priority</p></div><button type="button" onClick={() => setSelectedTask(null)} className="rounded-xl p-2 text-muted-foreground hover:bg-white/5" aria-label="Close"><X className="h-5 w-5" /></button></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2"><Button variant="outline" onClick={() => { onToggle?.(selectedTask); setSelectedTask(null); }}><Check className="h-4 w-4" /> {selectedTask.completed ? 'Mark incomplete' : 'Complete'}</Button><Button className="bg-gradient-brand" onClick={() => { onEdit?.(selectedTask); setSelectedTask(null); }}><Pencil className="h-4 w-4" /> Edit / reschedule</Button></div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-muted-foreground"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Complete this action and the next pending action becomes your new focus.</div></div>
        </div>
      </div>}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-3"><p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold">{value}</p><p className="text-[10px] text-muted-foreground">{sub}</p></div>;
}
