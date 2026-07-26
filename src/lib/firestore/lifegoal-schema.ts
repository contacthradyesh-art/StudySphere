import type { Timestamp } from 'firebase/firestore';

/**
 * Firestore data model for the Life Goal system (Phase A - Foundation).
 * Collections (under users/{uid}):
 *   lifeGoals/{goalId}            - top-level goals
 *   lifeMilestones/{milestoneId}  - milestones, each tagged with a lifeGoalId
 *
 * Named "LifeGoal" / "LifeMilestone" (not "Goal") to avoid clashing with the
 * existing `MonthlyGoal` in planner-schema.ts, which is a simpler, unrelated
 * month-scoped checklist item embedded inside monthlyPlan/{monthId}.
 */

export const LIFEGOAL_COLLECTIONS = {
  lifeGoals: 'lifeGoals',
  lifeMilestones: 'lifeMilestones'
} as const;

export type LifeGoalStatus = 'active' | 'completed' | 'archived';
export type LifeMilestoneStatus = 'pending' | 'in_progress' | 'completed';

export interface LifeGoal {
  id: string;
  title: string;
  description: string | null;
  /** Optional link to an exam/context tag, e.g. "SSC CHSL". */
  examTag: string | null;
  /** ISO date string YYYY-MM-DD, optional. */
  deadline: string | null;
  status: LifeGoalStatus;
  /** Accent color for UI, consistent with GlowCard's accent prop. */
  color: string;
  /** Manual sort order. */
  order: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  completedAt: Timestamp | null;
}

/** Payload used when creating a goal (id + status + timestamps assigned by the service). */
export type NewLifeGoal = Pick<LifeGoal, 'title' | 'description' | 'examTag' | 'deadline' | 'color'>;

export interface LifeMilestone {
  id: string;
  /** Parent goal reference. */
  lifeGoalId: string;
  title: string;
  /** ISO date string YYYY-MM-DD, optional. */
  deadline: string | null;
  status: LifeMilestoneStatus;
  order: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  completedAt: Timestamp | null;
}

/** Payload used when creating a milestone. */
export type NewLifeMilestone = Pick<LifeMilestone, 'lifeGoalId' | 'title' | 'deadline'>;
