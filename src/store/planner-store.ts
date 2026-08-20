import { create } from 'zustand';
import type { MonthlyGoal, Task, WeeklySlot } from '@/lib/firestore/planner-schema';

interface PlannerState {
  tasks: Task[];
  loading: boolean;
  weeklySlots: WeeklySlot[];
  weeklyLoading: boolean;
  monthlyGoals: MonthlyGoal[];
  monthlyLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setWeeklySlots: (slots: WeeklySlot[]) => void;
  setWeeklyLoading: (loading: boolean) => void;
  setMonthlyGoals: (goals: MonthlyGoal[]) => void;
  setMonthlyLoading: (loading: boolean) => void;
}

/** Client cache of the live planner data (hydrated from Firestore subscriptions). */
export const usePlannerStore = create<PlannerState>((set) => ({
  tasks: [],
  loading: true,
  weeklySlots: [],
  weeklyLoading: true,
  monthlyGoals: [],
  monthlyLoading: true,
  setTasks: (tasks) => set({ tasks, loading: false }),
  setLoading: (loading) => set({ loading }),
  setWeeklySlots: (weeklySlots) => set({ weeklySlots, weeklyLoading: false }),
  setWeeklyLoading: (weeklyLoading) => set({ weeklyLoading }),
  setMonthlyGoals: (monthlyGoals) => set({ monthlyGoals, monthlyLoading: false }),
  setMonthlyLoading: (monthlyLoading) => set({ monthlyLoading })
}));

/** Selector: tasks due on a given ISO date (YYYY-MM-DD). */
export function selectTasksForDate(tasks: Task[], isoDate: string) {
  return tasks.filter((t) => t.dueDate === isoDate);
}
