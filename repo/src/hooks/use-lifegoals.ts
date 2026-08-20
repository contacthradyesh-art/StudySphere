'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeLifeGoals, subscribeLifeMilestones } from '@/lib/lifegoals/lifegoal-service';
import { useLifeGoalStore } from '@/store/lifegoal-store';

/**
 * Subscribes the lifeGoal store to the current user's Firestore lifeGoals and
 * lifeMilestones. Mount once near the Planner tree; components read via
 * useLifeGoalStore. Mirrors useTasksSync().
 */
export function useLifeGoalsSync() {
  const { user } = useAuth();
  const setLifeGoals = useLifeGoalStore((s) => s.setLifeGoals);
  const setLifeGoalsLoading = useLifeGoalStore((s) => s.setLifeGoalsLoading);
  const setLifeMilestones = useLifeGoalStore((s) => s.setLifeMilestones);
  const setLifeMilestonesLoading = useLifeGoalStore((s) => s.setLifeMilestonesLoading);

  useEffect(() => {
    if (!user) return;
    setLifeGoalsLoading(true);
    const unsub = subscribeLifeGoals(user.uid, setLifeGoals);
    return () => unsub();
  }, [user, setLifeGoals, setLifeGoalsLoading]);

  useEffect(() => {
    if (!user) return;
    setLifeMilestonesLoading(true);
    const unsub = subscribeLifeMilestones(user.uid, setLifeMilestones);
    return () => unsub();
  }, [user, setLifeMilestones, setLifeMilestonesLoading]);
}
