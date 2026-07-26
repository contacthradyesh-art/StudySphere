'use client';

import { useMemo } from 'react';
import { useLifeGoalStore, selectMilestonesForGoal } from '@/store/lifegoal-store';
import type { LifeGoal } from '@/lib/firestore/lifegoal-schema';

export interface LifeGoalProgress {
  goal: LifeGoal;
  totalMilestones: number;
  completedMilestones: number;
  /** 0-100, derived live from milestone completion. Never stored in Firestore. */
  progress: number;
}

export interface LifeGoalInsights {
  loading: boolean;
  goals: LifeGoal[];
  /** Per-goal progress, same order as `goals`. */
  goalProgress: LifeGoalProgress[];
  /** Overall progress across all active goals (simple average), 0-100. */
  overallProgress: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
}

/**
 * Derives goal/milestone progress for the Planner's Goals tab and for
 * gamification badge stats. Goal progress is always computed from milestone
 * completion (done/total * 100) — the same pattern already used for
 * `goalProgress` (tasks-based) in use-dashboard-stats.ts — never read from a
 * stored field, so it can never go stale.
 */
export function useLifeGoalInsights(): LifeGoalInsights {
  const goals = useLifeGoalStore((s) => s.lifeGoals);
  const milestones = useLifeGoalStore((s) => s.lifeMilestones);
  const goalsLoading = useLifeGoalStore((s) => s.lifeGoalsLoading);
  const milestonesLoading = useLifeGoalStore((s) => s.lifeMilestonesLoading);

  return useMemo(() => {
    const goalProgress: LifeGoalProgress[] = goals.map((goal) => {
      const goalMilestones = selectMilestonesForGoal(milestones, goal.id);
      const total = goalMilestones.length;
      const completed = goalMilestones.filter((m) => m.status === 'completed').length;
      return {
        goal,
        totalMilestones: total,
        completedMilestones: completed,
        progress: total === 0 ? 0 : Math.round((completed / total) * 100)
      };
    });

    const activeGoals = goalProgress.filter((g) => g.goal.status === 'active');
    const overallProgress =
      activeGoals.length === 0
        ? 0
        : Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length);

    return {
      loading: goalsLoading || milestonesLoading,
      goals,
      goalProgress,
      overallProgress,
      activeGoalsCount: activeGoals.length,
      completedGoalsCount: goals.filter((g) => g.status === 'completed').length
    };
  }, [goals, milestones, goalsLoading, milestonesLoading]);
}
