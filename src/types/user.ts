import type { ExamId } from "./exam";
import type { MasteryLevel } from "./common";

export interface UserProfile {
  id: string;
  displayName: string;
  targetExams: ExamId[];
  examDates: Record<ExamId, string>;
  dailyStudyHours: number;
  currentStreak: number;
  longestStreak: number;
  bufferDaysUsed: number;
  bufferDaysTotal: number;
  totalXp: number;
  level: number;
  joinedAt: Date;
  lastActiveAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "dark";
  language: "en";
  notifications: boolean;
  dailyGoalMinutes: number;
  focusSessionMinutes: number;
  breakReminderMinutes: number;
}

export interface TopicMastery {
  topicId: string;
  examId: ExamId;
  level: MasteryLevel;
  accuracy: number;
  totalAttempts: number;
  correctAttempts: number;
  lastPracticed: Date;
  weakAreas: string[];
}

export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: XpReason;
  sourceId: string;
  earnedAt: Date;
}

export type XpReason =
  | "mock_completion" | "mistake_correction" | "revision_session"
  | "mastery_achieved" | "streak_milestone";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  bufferDaysRemaining: number;
  lastActiveDate: string;
  streakHistory: StreakDay[];
}

export interface StreakDay {
  date: string;
  active: boolean;
  bufferUsed: boolean;
}
