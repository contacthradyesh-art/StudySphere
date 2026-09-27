import { create } from 'zustand';
import type { Habit, HabitLog } from '@/lib/firestore/habit-schema';

interface HabitState {
  habits: Habit[];
  habitsLoading: boolean;
  habitLogs: Record<string, HabitLog[]>;
  setHabits: (habits: Habit[]) => void;
  setHabitsLoading: (loading: boolean) => void;
  addHabit: (habit: Habit) => void;
  removeHabit: (habitId: string) => void;
  setHabitLogs: (habitId: string, logs: HabitLog[]) => void;
  clearHabitLogs: (habitId: string) => void;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  habitsLoading: true,
  habitLogs: {},
  setHabits: (habits) => set({ habits, habitsLoading: false }),
  setHabitsLoading: (habitsLoading) => set({ habitsLoading }),
  addHabit: (habit) => set((s) => ({ habits: [...s.habits.filter((h) => h.id !== habit.id), habit] })),
  removeHabit: (habitId) => set((s) => ({ habits: s.habits.filter((h) => h.id !== habitId) })),
  setHabitLogs: (habitId, logs) =>
    set((s) => ({ habitLogs: { ...s.habitLogs, [habitId]: logs } })),
  clearHabitLogs: (habitId) =>
    set((s) => {
      const next = { ...s.habitLogs };
      delete next[habitId];
      return { habitLogs: next };
    })
}));

export function selectCompletedDayMsSet(logs: HabitLog[]): Set<number> {
  const set = new Set<number>();
  for (const log of logs) {
    if (!log.completed) continue;
    const [y, m, d] = log.date.split('-').map(Number);
    set.add(new Date(y, m - 1, d).setHours(0, 0, 0, 0));
  }
  return set;
}
