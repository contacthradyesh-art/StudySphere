import type { AnalyticsData } from "../types";

export function getMockAnalyticsData(): AnalyticsData {
  return {
    predictedScore: 156, readiness: 62, accuracy: 68, speed: 72, negativeMarks: 12.5, retentionRate: 74, revisionHealth: 58,
    weakTopicHeatmap: [
      { topic: "Profit & Loss", subject: "quantitative-aptitude", accuracy: 38, attempts: 45, intensity: "critical" },
      { topic: "Syllogism", subject: "reasoning", accuracy: 42, attempts: 30, intensity: "critical" },
      { topic: "Indian Economy", subject: "general-awareness", accuracy: 35, attempts: 20, intensity: "critical" },
      { topic: "Reading Comprehension", subject: "english", accuracy: 48, attempts: 25, intensity: "high" },
      { topic: "Geometry", subject: "quantitative-aptitude", accuracy: 30, attempts: 15, intensity: "critical" },
      { topic: "Seating Arrangement", subject: "reasoning", accuracy: 35, attempts: 18, intensity: "critical" },
      { topic: "Cloze Test", subject: "english", accuracy: 45, attempts: 22, intensity: "high" },
      { topic: "Indian History", subject: "general-awareness", accuracy: 40, attempts: 28, intensity: "high" },
      { topic: "Time, Speed & Distance", subject: "quantitative-aptitude", accuracy: 42, attempts: 35, intensity: "high" },
      { topic: "Indian Geography", subject: "general-awareness", accuracy: 38, attempts: 20, intensity: "critical" },
    ],
    studyTrends: Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i));
      return { date: d.toISOString().split("T")[0], studyMinutes: 60 + Math.floor(Math.random() * 120), accuracy: 55 + Math.floor(Math.random() * 30), testsCompleted: Math.random() > 0.6 ? 1 : 0 };
    }),
    subjectAccuracy: [
      { subject: "Quantitative Aptitude", accuracy: 55, totalQuestions: 200, color: "#007edc" },
      { subject: "Reasoning", accuracy: 68, totalQuestions: 180, color: "#00e805" },
      { subject: "English", accuracy: 72, totalQuestions: 120, color: "#ffb800" },
      { subject: "General Awareness", accuracy: 45, totalQuestions: 150, color: "#ff4757" },
    ],
    recentTestScores: [52, 58, 55, 63, 60, 68, 65, 72],
  };
}
