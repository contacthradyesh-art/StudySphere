'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, GraduationCap, Timer } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { XP_REWARDS } from '@/lib/gamification/xp';
import { formatDuration } from '@/lib/utils';
import type { Task } from '@/lib/firestore/planner-schema';
import type { PomodoroSession } from '@/lib/firestore/pomodoro-schema';
import type { UpcomingGoal } from '@/lib/planner/monthly-plan-service';

interface ActivityItem {
  id: string;
  time: number; // epoch ms, for sorting
  label: string;
  meta: string;
  icon: typeof CheckCircle2;
  color: string;
  xp?: number;
}

function toMillis(ts: unknown): number {
  const t = ts as { toMillis?: () => number } | null;
  return t?.toMillis ? t.toMillis() : 0;
}

export function RecentActivity({
  tasks, sessions, goals
}: { tasks: Task[]; sessions: PomodoroSession[]; goals: UpcomingGoal[] }) {
  const items = useMemo<ActivityItem[]>(() => {
    const fromTasks: ActivityItem[] = tasks
      .filter((t) => t.completed)
      .map((t) => ({
        id: `task-${t.id}`,
        time: toMillis(t.updatedAt),
        label: t.title,
        meta: t.subject ? `${t.subject} task completed` : 'Task completed',
        icon: CheckCircle2,
        color: '#34d399',
        xp: XP_REWARDS.completeTask
      }));

    const fromSessions: ActivityItem[] = sessions
      .filter((s) => s.phase === 'focus' && s.completed)
      .map((s) => ({
        id: `session-${s.id}`,
        time: toMillis(s.endedAt),
        label: s.subject ? `${s.subject} focus session` : 'Focus session',
        meta: `${formatDuration(s.completedSeconds)} focused`,
        icon: Timer,
        color: '#818cf8',
        xp: XP_REWARDS.completePomodoro
      }));

    const fromGoals: ActivityItem[] = goals
      .filter((g) => g.done)
      .map((g) => ({
        id: `goal-${g.id}`,
        time: 0,
        label: g.label,
        meta: 'Goal completed',
        icon: GraduationCap,
        color: '#fbbf24'
      }));

    return [...fromTasks, ...fromSessions, ...fromGoals]
      .sort((a, b) => b.time - a.time)
      .slice(0, 8);
  }, [tasks, sessions, goals]);

  return (
    <GlowCard delay={0.05} accent="#34d399" className="space-y-3">
      <SectionHeading eyebrow="Recent Activity" title="Latest progress" />

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Complete a task or focus session to see activity here.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: `${item.color}1f` }}>
                <item.icon className="h-4 w-4" style={{ color: item.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.meta}</p>
              </div>
              {item.xp && <span className="shrink-0 text-xs font-semibold text-amber-300">+{item.xp} XP</span>}
            </motion.li>
          ))}
        </ul>
      )}
    </GlowCard>
  );
}
