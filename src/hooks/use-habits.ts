'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeHabits, subscribeHabitLogs } from '@/lib/habits/habit-service';
import { useHabitStore } from '@/store/habit-store';

export function useHabitsSync() {
  const { user } = useAuth();
  const habits = useHabitStore((s) => s.habits);
  const setHabits = useHabitStore((s) => s.setHabits);
  const setHabitsLoading = useHabitStore((s) => s.setHabitsLoading);
  const setHabitLogs = useHabitStore((s) => s.setHabitLogs);
  const clearHabitLogs = useHabitStore((s) => s.clearHabitLogs);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setHabitsLoading(false);
      return;
    }
    setHabitsLoading(true);
    const unsub = subscribeHabits(user.uid, setHabits);
    return () => unsub();
  }, [user, setHabits, setHabitsLoading]);

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
