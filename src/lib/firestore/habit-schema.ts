import type { Timestamp } from 'firebase/firestore';

/**
 * Firestore data model for the Habit Operating System (Foundation Phase).
 * Collections (under users/{uid}):
 *   habits/{habitId}                  - habit definitions
 *   habits/{habitId}/logs/{YYYY-MM-DD} - per-day completion log, doc id = date
 *     (subcollection, not a flat collection, because streak/heatmap queries
 *      are always scoped to a single habit — matches the existing
 *      per-user-scoped listener pattern used in pomodoro/session-service.ts)
 */

export const HABIT_COLLECTIONS = {
  habits: 'habits',
  logs: 'logs'
} as const;

export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type HabitStatus = 'active' | 'archived';

export interface Habit {
  id: string;
  title: string;
  /** lucide-react icon name, e.g. "BookOpen". */
  icon: string;
  /** Accent color for UI, consistent with GlowCard's accent prop. */
  color: string;
  frequency: HabitFrequency;
  /** Only used when frequency === 'custom': specific weekdays, 0=Sun..6=Sat. */
  customDays: number[] | null;
  /** Only used when frequency === 'custom': "N times per period", any day. */
  timesPerPeriod: number | null;
  status: HabitStatus;
  order: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/** Payload used when creating a habit (id + timestamps assigned by the service). */
export type NewHabit = Pick<
  Habit,
  'title' | 'icon' | 'color' | 'frequency' | 'customDays' | 'timesPerPeriod'
>;

export interface HabitLog {
  /** Doc id, ISO date string YYYY-MM-DD. */
  id: string;
  date: string;
  completed: boolean;
  completedAt: Timestamp | null;
}
