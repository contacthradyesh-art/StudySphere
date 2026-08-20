import type { SubjectArea } from "@/types/common";

export interface AnalyticsData {
  predictedScore: number; readiness: number; accuracy: number; speed: number; negativeMarks: number;
  retentionRate: number; revisionHealth: number; weakTopicHeatmap: HeatmapEntry[];
  studyTrends: TrendPoint[]; subjectAccuracy: SubjectAccuracyEntry[]; recentTestScores: number[];
}
export interface HeatmapEntry { topic: string; subject: SubjectArea; accuracy: number; attempts: number; intensity: "low" | "medium" | "high" | "critical"; }
export interface TrendPoint { date: string; studyMinutes: number; accuracy: number; testsCompleted: number; }
export interface SubjectAccuracyEntry { subject: string; accuracy: number; totalQuestions: number; color: string; }
