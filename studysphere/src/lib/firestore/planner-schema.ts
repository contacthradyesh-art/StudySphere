export const PLANNER_COLLECTIONS = {
  weeklyPlan: 'weeklyPlan',
  monthlyPlan: 'monthlyPlan',
  tasks: 'tasks',
} as const;

export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Computer Science',
  'History',
  'Geography',
] as const;

export type Subject = (typeof SUBJECTS)[number];

export interface WeeklySlot {
  day: number;
  subject: Subject;
  hours: number;
  isRevision: boolean;
}

export interface WeeklyPlan {
  id?: string;
  slots: WeeklySlot[];
  updatedAt?: unknown;
}

export interface Task {
  id: string;
  title: string;
  subject?: Subject;
  completed?: boolean;
  dueDate?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type NewTask = Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'>;

export interface MonthlyGoal {
  id: string;
  title: string;
  targetDate: string;
  done: boolean;
}

export interface MonthlyPlan {
  id?: string;
  goals: MonthlyGoal[];
  updatedAt?: unknown;
}
