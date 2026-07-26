'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeSessions } from '@/lib/pomodoro/session-service';
import { usePomodoroStore } from '@/store/pomodoro-store';

/**
 * Syncs the current user's pomodoro sessions into the shared pomodoro store.
 * Call this on any page that needs session data (Planner analytics, Growth OS).
 * The Pomodoro page already does this inline; calling this there too is safe
 * because Zustand deduplicates state writes.
 */
export function useSessionsSync() {
  const { user } = useAuth();
  const setSessions = usePomodoroStore((s) => s.setSessions);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeSessions(user.uid, setSessions);
    return () => unsub();
  }, [user, setSessions]);
}
