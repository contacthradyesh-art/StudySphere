import type { Timestamp } from 'firebase/firestore';

/**
 * Firestore data model for the Smart Study Planner (Milestone 2).
 * Collections (all under users/{uid}):
 *   tasks/{taskId}            - daily planner tasks
 *   weeklyPlan/{weekId}       - weekly schedule (one doc per ISO week)
 *   monthlyPlan/{monthId}     - monthly long-term plan (one doc per YYYY-MM)
 */

export const PLANNER_COLLECTIONS = {
  tasks: 'tasks',
  weeklyPlan: 'weeklyPlan',
  monthlyPlan: 'monthlyPlan'
} as const;

export type Priority = 'low' | 'medium' | 'high';

export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Computer Science', 'History', 'Geography'
] as const;
export type Subject = (typeof SUBJECTS)[number];

export interface Task {
  id: string;
  title: string;
  subject: Subject | null;
  priority: Priority;
  /** ISO date string YYYY-MM-DD */
  dueDate: string;
  completed: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  /** Foundation Phase: optional link to a LifeGoal. Undefined on old tasks. */
  lifeGoalId?: string | null;
  /** Foundation Phase: optional link to a LifeMilestone. Undefined on old tasks. */
  lifeMilestoneId?: string | null;
  /** Optional reminder alarm, epoch ms. Undefined/null on tasks with no alarm. */
  reminderAt?: number | null;
}

/** Payload used when creating a task (id + timestamps assigned by the service). */
export type NewTask = Pick<Task, 'title' | 'subject' | 'priority' | 'dueDate'> &
  Partial<Pick<Task, 'lifeGoalId' | 'lifeMilestoneId' | 'reminderAt'>>;

export interface WeeklySlot {
  day: number; // 0=Mon ... 6=Sun
  subject: Subject;
  hours: number;
  isRevision: boolean;
}

export interface WeeklyPlan {
  id: string; // ISO week key e.g. 2026-W24
  slots: WeeklySlot[];
  updatedAt: Timestamp | null;
}

export interface MonthlyGoal {
  id: string;
  label: string;
  subject: Subject | null;
  targetDate: string; // YYYY-MM-DD
  done: boolean;
}

export interface MonthlyPlan {
  id: string; // YYYY-MM
  goals: MonthlyGoal[];
  updatedAt: Timestamp | null;
}