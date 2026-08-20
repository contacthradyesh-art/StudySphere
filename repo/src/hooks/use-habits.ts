'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeHabits, subscribeHabitLogs } from '@/lib/habits/habit-service';
import { useHabitStore } from '@/store/habit-store';

/**
 * Subscribes the habit store to the current user's Firestore habits, and
 * dynamically manages one log-listener per active habit (logs live in a
 * subcollection under each habit, see habit-schema.ts). Mount once near the
 * Planner tree; components read via useHabitStore.
 */
export function useHabitsSync() {
  const { user } = useAuth();
  const habits = useHabitStore((s) => s.habits);
  const setHabits = useHabitStore((s) => s.setHabits);
  const setHabitsLoading = useHabitStore((s) => s.setHabitsLoading);
  const setHabitLogs = useHabitStore((s) => s.setHabitLogs);
  const clearHabitLogs = useHabitStore((s) => s.clearHabitLogs);

  // Subscribe to the habit list itself.
  useEffect(() => {
    if (!user) return;
    setHabitsLoading(true);
    const unsub = subscribeHabits(user.uid, setHabits);
    return () => unsub();
  }, [user, setHabits, setHabitsLoading]);

  // Subscribe to logs for each known habit; clean up listeners for habits
  // that disappear (deleted) so the store doesn't accumulate stale entries.
  useEffect(() => {
    if (!user) return;
    const unsubs = habits.map((h) => subscribeHabitLogs(user.uid, h.id, (logs) => setHabitLogs(h.id, logs)));
    return () => unsubs.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, habits.map((h) => h.id).join(',')]);

  useEffect(() => {
    return () => {
      habits.forEach((h) => clearHabitLogs(h.id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
