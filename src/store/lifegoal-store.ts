import { create } from 'zustand';
import type { LifeGoal, LifeMilestone } from '@/lib/firestore/lifegoal-schema';

interface LifeGoalState {
  lifeGoals: LifeGoal[];
  lifeGoalsLoading: boolean;
  lifeMilestones: LifeMilestone[];
  lifeMilestonesLoading: boolean;
  setLifeGoals: (goals: LifeGoal[]) => void;
  setLifeGoalsLoading: (loading: boolean) => void;
  addLifeGoal: (goal: LifeGoal) => void;
  removeLifeGoal: (goalId: string) => void;
  setLifeMilestones: (milestones: LifeMilestone[]) => void;
  setLifeMilestonesLoading: (loading: boolean) => void;
}

export const useLifeGoalStore = create<LifeGoalState>((set) => ({
  lifeGoals: [],
  lifeGoalsLoading: true,
  lifeMilestones: [],
  lifeMilestonesLoading: true,
  setLifeGoals: (lifeGoals) => set({ lifeGoals, lifeGoalsLoading: false }),
  setLifeGoalsLoading: (lifeGoalsLoading) => set({ lifeGoalsLoading }),
  addLifeGoal: (goal) => set((s) => ({ lifeGoals: [...s.lifeGoals.filter((g) => g.id !== goal.id), goal] })),
  removeLifeGoal: (goalId) => set((s) => ({ lifeGoals: s.lifeGoals.filter((g) => g.id !== goalId) })),
  setLifeMilestones: (lifeMilestones) => set({ lifeMilestones, lifeMilestonesLoading: false }),
  setLifeMilestonesLoading: (lifeMilestonesLoading) => set({ lifeMilestonesLoading })
}));

export function selectMilestonesForGoal(milestones: LifeMilestone[], lifeGoalId: string) {
  return milestones.filter((m) => m.lifeGoalId === lifeGoalId);
}
