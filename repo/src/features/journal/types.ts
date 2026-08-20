import type { ExamId } from "@/types/exam";
import type { SubjectArea } from "@/types/common";

export type ErrorType = "conceptual" | "silly" | "time-pressure" | "guessing";

export interface JournalEntry {
  id: string; questionText: string; correctAnswer: string; userAnswer: string; topic: string;
  subject: SubjectArea; errorType: ErrorType; examId: ExamId; mockTestId?: string;
  notes: string; resolved: boolean; resolvedAt?: Date; createdAt: Date;
}

export interface JournalStats {
  total: number; resolved: number; unresolved: number; byErrorType: Record<ErrorType, number>;
  topWeakTopics: Array<{ topic: string; count: number }>;
}
