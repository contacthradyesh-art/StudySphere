'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeTasks } from '@/lib/planner/task-service';
import { usePlannerStore } from '@/store/planner-store';

/**
 * Subscribes the planner store to the current user's Firestore tasks.
 * Mount once near the dashboard tree; components read via usePlannerStore.
 */
export function useTasksSync() {
  const { user } = useAuth();
  const setTasks = usePlannerStore((s) => s.setTasks);
  const setLoading = usePlannerStore((s) => s.setLoading);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeTasks(user.uid, setTasks);
    return () => unsub();
  }, [user, setTasks, setLoading]);
}
