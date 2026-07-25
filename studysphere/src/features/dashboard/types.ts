import type { ExamId } from "@/types/exam";
import type { MasteryLevel } from "@/types/common";

export interface ReadinessScore {
  overall: number;
  components: { syllabusCoverage: number; accuracy: number; revision: number; consistency: number; speed: number; };
  trend: "improving" | "stable" | "declining";
  lastUpdated: Date;
}

export interface TodaysOneThing {
  id: string; title: string; description: string;
  type: "revision" | "practice" | "mock" | "weakness" | "new-topic";
  estimatedMinutes: number; priority: "critical" | "high" | "medium";
  relatedTopicId?: string; relatedExamId?: ExamId; completed: boolean;
}

export interface WeakTopic {
  topicId: string; topicName: string; subject: string; accuracy: number;
  totalAttempts: number; lastAttempted: Date; trend: "improving" | "stable" | "declining"; examIds: ExamId[];
}

export interface MistakeEntry {
  id: string; questionSummary: string; correctAnswer: string; userAnswer: string;
  topic: string; subject: string; errorType: "conceptual" | "silly" | "time-pressure" | "guessing";
  examId: ExamId; mockTestId: string; createdAt: Date; resolved: boolean; resolvedAt?: Date; notes?: string;
}

export interface ExamOverlap {
  topicName: string; topicId: string;
  sharedExams: Array<{ examId: ExamId; examName: string; }>;
  mastery: MasteryLevel; subject: string;
}

export interface StreakDisplay {
  current: number; longest: number; bufferDaysRemaining: number;
  weekHistory: Array<{ day: string; active: boolean; bufferUsed: boolean; date: string; }>;
}

export interface BufferDayInfo { total: number; used: number; remaining: number; lastUsed?: string; }

export interface DashboardData {
  readiness: ReadinessScore; todaysOneThing: TodaysOneThing; weakTopics: WeakTopic[];
  recentMistakes: MistakeEntry[]; examOverlaps: ExamOverlap[]; streak: StreakDisplay; bufferDays: BufferDayInfo;
  studyStats: { todayMinutes: number; weekMinutes: number; monthMinutes: number; testsThisWeek: number; cardsReviewed: number; };
}
