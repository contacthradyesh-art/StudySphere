'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Clock3, AlertTriangle, Pause } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { subjectMeta } from '@/lib/planner/subject-meta';
import { cn } from '@/lib/utils';
import { deriveTaskStatus, formatTimeLabel, splitScheduledTasks, type LiveTaskStatus } from '@/lib/planner/schedule';
import type { Task } from '@/lib/firestore/planner-schema';

const STATUS_META: Record<LiveTaskStatus, { color: string; Icon: typeof Check; label: string }> = {
  completed: { color: '#22c55e', Icon: Check, label: 'Done' },
  active: { color: '#38bdf8', Icon: Pause, label: 'Active' },
  missed: { color: '#ef4444', Icon: AlertTriangle, label: 'Missed' },
  upcoming: { color: '#94a3b8', Icon: Circle, label: 'Upcoming' }
};

function ScheduleRow({ task, status, onToggle }: { task: Task; status: LiveTaskStatus; onToggle: (t: Task) => void }) {
  const meta = subjectMeta(task.subject);
  const { color, Icon } = STATUS_META[status];
  const isActive = status === 'active';

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative flex items-start gap-3 py-2.5"
    >
      <div className="w-14 shrink-0 pt-1.5 text-right text-xs tabular-nums text-muted-foreground">
        {task.startTime && <div>{formatTimeLabel(task.startTime)}</div>}
        {task.endTime && <div className="text-[10px] opacity-70">{formatTimeLabel(task.endTime)}</div>}
      </div>

      <span
        className="relative z-10 mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-background/80"
        style={{ boxShadow: isActive ? `0 0 20px -2px ${color}` : `0 0 12px -4px ${color}` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </span>

      <button
        onClick={() => onToggle(task)}
        className={cn(
          'min-w-0 flex-1 rounded-xl border p-3 text-left transition-colors',
          isActive ? 'border-sky-400/50 bg-sky-500/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]',
          status === 'completed' && 'opacity-70'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className={cn('truncate text-sm font-semibold', status === 'completed' && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          {isActive && <span className="shrink-0 rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-300">Active</span>}
          {status === 'missed' && <span className="shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-red-300">Missed</span>}
        </div>
        {task.subject && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <meta.icon className="h-3 w-3" style={{ color: meta.glow }} /> {task.subject}
          </p>
        )}
      </button>
    </motion.li>
  );
}

export function TodaySchedule({ tasksToday, onToggle }: { tasksToday: Task[]; onToggle: (t: Task) => void }) {
  // Re-derive live status every 30s so tasks flip upcoming -> active -> missed
  // without needing a page refresh.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const { scheduled, unscheduled } = splitScheduledTasks(tasksToday);

  return (
    <GlowCard delay={0.1} accent="#38bdf8" className="space-y-4">
      <SectionHeading eyebrow="Today's Schedule" title="Your time-blocked day" />

      {scheduled.length === 0 && unscheduled.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nothing planned for today yet. Add a task with a start &amp; end time to see it on the timeline.
        </p>
      )}

      {scheduled.length > 0 && (
        <ol className="relative pl-0">
          <div className="absolute bottom-3 left-[75px] top-3 w-px bg-gradient-to-b from-sky-400/40 via-white/10 to-transparent" aria-hidden />
          {scheduled.map((task) => (
            <ScheduleRow key={task.id} task={task} status={deriveTaskStatus(task, now)} onToggle={onToggle} />
          ))}
        </ol>
      )}

      {unscheduled.length > 0 && (
        <div className="space-y-2 border-t border-white/10 pt-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" /> Unscheduled ({unscheduled.length})
          </p>
          {unscheduled.map((task) => (
            <button
              key={task.id}
              onClick={() => onToggle(task)}
              className={cn(
                'block w-full rounded-lg border border-white/10 bg-white/[0.02] p-2.5 text-left text-sm transition-colors hover:bg-white/[0.04]',
                task.completed && 'opacity-60'
              )}
            >
              <span className={cn(task.completed && 'line-through text-muted-foreground')}>{task.title}</span>
              {task.subject && <span className="ml-2 text-xs text-muted-foreground">{task.subject}</span>}
            </button>
          ))}
        </div>
      )}
    </GlowCard>
  );
}
