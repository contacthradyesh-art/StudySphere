'use client';

import { useMemo } from 'react';
import { useHabitStore, selectCompletedDayMsSet } from '@/store/habit-store';
import { computeStreak, startOfDayMs, DAY_MS } from '@/lib/streak';
import type { Habit, HabitLog } from '@/lib/firestore/habit-schema';

export interface HabitProgress {
  habit: Habit;
  streak: number;
  completedToday: boolean;
  /** Last 30 days, oldest first — for heatmap rendering. */
  last30Days: { dateMs: number; completed: boolean }[];
  /** Completion % over the last 30 days (active habits only). */
  consistency30d: number;
}

export interface HabitInsights {
  loading: boolean;
  habits: Habit[];
  habitProgress: HabitProgress[];
  /** Of today's active habits, how many are completed (0-100). */
  todayCompletionPct: number;
  /** Longest streak across all habits — feeds the 'habit-hero' badge. */
  longestHabitStreak: number;
}

function buildLast30Days(logs: HabitLog[]): { dateMs: number; completed: boolean }[] {
  const completedSet = selectCompletedDayMsSet(logs);
  const todayMs = startOfDayMs(new Date());
  const days: { dateMs: number; completed: boolean }[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const dateMs = todayMs - i * DAY_MS;
    days.push({ dateMs, completed: completedSet.has(dateMs) });
  }
  return days;
}

/**
 * Derives per-habit streak, today's completion, and a 30-day heatmap series
 * for the Planner's Habits tab and for gamification badge stats. Streak math
 * reuses lib/streak.ts (the same implementation as the pomodoro streak) — no
 * duplicated streak logic.
 */
export function useHabitInsights(): HabitInsights {
  const habits = useHabitStore((s) => s.habits);
  const habitLogs = useHabitStore((s) => s.habitLogs);
  const loading = useHabitStore((s) => s.habitsLoading);

  return useMemo(() => {
    const todayMs = startOfDayMs(new Date());
    const activeHabits = habits.filter((h) => h.status === 'active');

    const habitProgress: HabitProgress[] = activeHabits.map((habit) => {
      const logs = habitLogs[habit.id] ?? [];
      const completedSet = selectCompletedDayMsSet(logs);
      const last30Days = buildLast30Days(logs);
      const completedCount = last30Days.filter((d) => d.completed).length;

      return {
        habit,
        streak: computeStreak(completedSet),
        completedToday: completedSet.has(todayMs),
        last30Days,
        consistency30d: Math.round((completedCount / 30) * 100)
      };
    });

    const todayCompletionPct =
      activeHabits.length === 0
        ? 0
        : Math.round(
            (habitProgress.filter((h) => h.completedToday).length / activeHabits.length) * 100
          );

    const longestHabitStreak = habitProgress.reduce((max, h) => Math.max(max, h.streak), 0);

    return {
      loading,
      habits,
      habitProgress,
      todayCompletionPct,
      longestHabitStreak
    };
  }, [habits, habitLogs, loading]);
}
