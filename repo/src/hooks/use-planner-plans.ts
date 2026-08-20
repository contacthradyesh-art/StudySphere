'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeWeeklyPlan } from '@/lib/planner/weekly-plan-service';
import { subscribeMonthlyPlan, subscribeUpcomingGoals, type UpcomingGoal } from '@/lib/planner/monthly-plan-service';
import { usePlannerStore } from '@/store/planner-store';

export function usePlannerPlansSync() {
  const { user } = useAuth();
  const setWeeklySlots = usePlannerStore((s) => s.setWeeklySlots);
  const setWeeklyLoading = usePlannerStore((s) => s.setWeeklyLoading);
  const setMonthlyGoals = usePlannerStore((s) => s.setMonthlyGoals);
  const setMonthlyLoading = usePlannerStore((s) => s.setMonthlyLoading);

  useEffect(() => {
    if (!user) return;
    setWeeklyLoading(true);
    setMonthlyLoading(true);
    const unsubWeekly = subscribeWeeklyPlan(user.uid, (plan) => setWeeklySlots(plan?.slots ?? []));
    const unsubMonthly = subscribeMonthlyPlan(user.uid, (goals) => setMonthlyGoals(goals));
    return () => { unsubWeekly(); unsubMonthly(); };
  }, [user, setWeeklySlots, setWeeklyLoading, setMonthlyGoals, setMonthlyLoading]);
}

/** Subscribe to upcoming goals/exams across all months. */
export function useUpcomingGoals(): UpcomingGoal[] {
  const { user } = useAuth();
  const [goals, setGoals] = useState<UpcomingGoal[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUpcomingGoals(user.uid, setGoals);
    return () => unsub();
  }, [user]);

  return goals;
}
