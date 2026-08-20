import type { Task } from '@/lib/firestore/planner-schema';

export type LiveTaskStatus = 'completed' | 'active' | 'missed' | 'upcoming';

/** Minutes since midnight for an "HH:mm" string. */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Derives a task's live status purely from its own fields + the current
 * clock time \u2014 nothing is persisted here (Strict Mode's persisted
 * missed/skipped tracking is a later phase). A task only becomes
 * "active"/"missed" if it has a startTime; untimed tasks are always either
 * "completed" or "upcoming".
 */
export function deriveTaskStatus(task: Task, now: Date): LiveTaskStatus {
  if (task.completed) return 'completed';
  if (!task.startTime) return 'upcoming';

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = toMinutes(task.startTime);
  const endMin = task.endTime ? toMinutes(task.endTime) : startMin + 60;

  if (nowMin < startMin) return 'upcoming';
  if (nowMin >= startMin && nowMin < endMin) return 'active';
  return 'missed'; // past its end time, never marked complete
}

/** "09:00" -> "9:00 AM" for display. */
export function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Duration in minutes between a task's start and end time, or null if untimed. */
export function taskDurationMinutes(task: Task): number | null {
  if (!task.startTime || !task.endTime) return null;
  return toMinutes(task.endTime) - toMinutes(task.startTime);
}

export interface TodayGoalStats {
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  completionPct: number;
  plannedFocusMinutes: number;
  /** Sum of durations of tasks that are actually completed. */
  actualFocusMinutes: number;
}

/** Computes the "Today's Goal" card stats from today's tasks \u2014 all real, nothing hardcoded. */
export function computeTodayGoalStats(tasksToday: Task[]): TodayGoalStats {
  const totalTasks = tasksToday.length;
  const completedTasks = tasksToday.filter((t) => t.completed).length;
  const plannedFocusMinutes = tasksToday.reduce((sum, t) => sum + (taskDurationMinutes(t) ?? 0), 0);
  const actualFocusMinutes = tasksToday
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + (taskDurationMinutes(t) ?? 0), 0);

  return {
    totalTasks,
    completedTasks,
    remainingTasks: totalTasks - completedTasks,
    completionPct: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    plannedFocusMinutes,
    actualFocusMinutes
  };
}

/** Splits today's tasks into a time-sorted schedule + an unscheduled bucket. */
export function splitScheduledTasks(tasksToday: Task[]): { scheduled: Task[]; unscheduled: Task[] } {
  const scheduled = tasksToday
    .filter((t) => !!t.startTime)
    .sort((a, b) => (a.startTime! < b.startTime! ? -1 : a.startTime! > b.startTime! ? 1 : 0));
  const unscheduled = tasksToday.filter((t) => !t.startTime);
  return { scheduled, unscheduled };
}
