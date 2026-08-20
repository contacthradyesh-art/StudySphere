import type { ExamId } from "@/types/exam";
import type { SubjectArea } from "@/types/common";

export type PlanView = "daily" | "weekly" | "mission";
export type TaskStatus = "pending" | "in-progress" | "completed" | "skipped" | "rescheduled";
export type TaskType = "study" | "revision" | "mock-test" | "flashcard-review" | "practice" | "break";

export interface PlanTask {
  id: string; title: string; description?: string; type: TaskType; subject?: SubjectArea; topic?: string;
  examId?: ExamId; date: string; startTime?: string; durationMinutes: number; status: TaskStatus;
  priority: "high" | "medium" | "low"; isBufferDay: boolean; isAiSuggested: boolean;
}

export interface DailyPlan {
  date: string; dayLabel: string; tasks: PlanTask[]; totalMinutes: number; completedMinutes: number;
  isBufferDay: boolean; isToday: boolean;
}

export interface WeeklyPlan { weekStart: string; weekEnd: string; days: DailyPlan[]; totalTasks: number; completedTasks: number; }

export interface Mission {
  id: string; title: string; description: string; examId: ExamId; targetDate: string;
  milestones: Milestone[]; progress: number; status: "active" | "completed" | "paused";
}

export interface Milestone { id: string; title: string; targetDate: string; completed: boolean; tasks: string[]; }
