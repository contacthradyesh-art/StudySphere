import { create } from 'zustand';
import type { Habit, HabitLog } from '@/lib/firestore/habit-schema';

interface HabitState {
  habits: Habit[];
  habitsLoading: boolean;
  /** Logs grouped by habitId. A habit with no entry yet means its logs haven't loaded. */
  habitLogs: Record<string, HabitLog[]>;
  setHabits: (habits: Habit[]) => void;
  setHabitsLoading: (loading: boolean) => void;
  setHabitLogs: (habitId: string, logs: HabitLog[]) => void;
  /** Drop logs for habits that are no longer subscribed (e.g. habit deleted/archived out of view). */
  clearHabitLogs: (habitId: string) => void;
}

/** Client cache of the live Habit + HabitLog data (hydrated from Firestore subscriptions). */
export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  habitsLoading: true,
  habitLogs: {},
  setHabits: (habits) => set({ habits, habitsLoading: false }),
  setHabitsLoading: (habitsLoading) => set({ habitsLoading }),
  setHabitLogs: (habitId, logs) =>
    set((s) => ({ habitLogs: { ...s.habitLogs, [habitId]: logs } })),
  clearHabitLogs: (habitId) =>
    set((s) => {
      const next = { ...s.habitLogs };
      delete next[habitId];
      return { habitLogs: next };
    })
}));

/** Selector: a Set of start-of-day ms timestamps where the habit was completed (for streak/heatmap use). */
export function selectCompletedDayMsSet(logs: HabitLog[]): Set<number> {
  const set = new Set<number>();
  for (const log of logs) {
    if (!log.completed) continue;
    const [y, m, d] = log.date.split('-').map(Number);
    set.add(new Date(y, m - 1, d).setHours(0, 0, 0, 0));
  }
  return set;
}
