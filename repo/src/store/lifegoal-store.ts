import { create } from 'zustand';
import type { LifeGoal, LifeMilestone } from '@/lib/firestore/lifegoal-schema';

interface LifeGoalState {
  lifeGoals: LifeGoal[];
  lifeGoalsLoading: boolean;
  lifeMilestones: LifeMilestone[];
  lifeMilestonesLoading: boolean;
  setLifeGoals: (goals: LifeGoal[]) => void;
  setLifeGoalsLoading: (loading: boolean) => void;
  setLifeMilestones: (milestones: LifeMilestone[]) => void;
  setLifeMilestonesLoading: (loading: boolean) => void;
}

/** Client cache of the live LifeGoal/LifeMilestone data (hydrated from Firestore subscriptions). */
export const useLifeGoalStore = create<LifeGoalState>((set) => ({
  lifeGoals: [],
  lifeGoalsLoading: true,
  lifeMilestones: [],
  lifeMilestonesLoading: true,
  setLifeGoals: (lifeGoals) => set({ lifeGoals, lifeGoalsLoading: false }),
  setLifeGoalsLoading: (lifeGoalsLoading) => set({ lifeGoalsLoading }),
  setLifeMilestones: (lifeMilestones) => set({ lifeMilestones, lifeMilestonesLoading: false }),
  setLifeMilestonesLoading: (lifeMilestonesLoading) => set({ lifeMilestonesLoading })
}));

/** Selector: milestones belonging to a given goal, in manual sort order. */
export function selectMilestonesForGoal(milestones: LifeMilestone[], lifeGoalId: string) {
  return milestones.filter((m) => m.lifeGoalId === lifeGoalId);
}
