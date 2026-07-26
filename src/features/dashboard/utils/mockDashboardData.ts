import type { DashboardData, ReadinessScore, TodaysOneThing, WeakTopic, MistakeEntry, ExamOverlap, StreakDisplay, BufferDayInfo } from "../types";

export function getMockDashboardData(): DashboardData {
  const readiness: ReadinessScore = {
    overall: 62,
    components: { syllabusCoverage: 45, accuracy: 71, revision: 58, consistency: 80, speed: 55 },
    trend: "improving", lastUpdated: new Date(),
  };

  const todaysOneThing: TodaysOneThing = {
    id: "tot-1", title: "Revise Percentage & Profit-Loss",
    description: "You scored below 50% on this topic in your last 2 mock tests. A focused 30-minute revision session can boost your score significantly.",
    type: "weakness", estimatedMinutes: 30, priority: "critical",
    relatedTopicId: "quant-percentage", relatedExamId: "ssc-cgl", completed: false,
  };

  const weakTopics: WeakTopic[] = [
    { topicId: "quant-percentage", topicName: "Percentage & Profit-Loss", subject: "Quantitative Aptitude", accuracy: 38, totalAttempts: 45, lastAttempted: new Date(Date.now() - 86400000), trend: "declining", examIds: ["ssc-cgl", "ibps-po", "rrb-ntpc"] },
    { topicId: "reasoning-syllogism", topicName: "Syllogism", subject: "Reasoning", accuracy: 42, totalAttempts: 30, lastAttempted: new Date(Date.now() - 172800000), trend: "stable", examIds: ["ssc-cgl", "ibps-po"] },
    { topicId: "english-rc", topicName: "Reading Comprehension", subject: "English", accuracy: 48, totalAttempts: 25, lastAttempted: new Date(Date.now() - 259200000), trend: "improving", examIds: ["ssc-cgl", "ibps-po", "sbi-po"] },
    { topicId: "ga-economy", topicName: "Indian Economy", subject: "General Awareness", accuracy: 35, totalAttempts: 20, lastAttempted: new Date(Date.now() - 345600000), trend: "declining", examIds: ["ssc-cgl", "upsc-cse", "rrb-ntpc"] },
  ];

  const recentMistakes: MistakeEntry[] = [
    { id: "m-1", questionSummary: "If CP is Rs 800 and SP is Rs 920, find profit %?", correctAnswer: "15%", userAnswer: "12%", topic: "Profit & Loss", subject: "Quantitative Aptitude", errorType: "silly", examId: "ssc-cgl", mockTestId: "mt-101", createdAt: new Date(Date.now() - 3600000), resolved: false },
    { id: "m-2", questionSummary: "All cats are animals. Some animals are dogs. Conclusion?", correctAnswer: "No definite conclusion about cats and dogs", userAnswer: "Some cats are dogs", topic: "Syllogism", subject: "Reasoning", errorType: "conceptual", examId: "ssc-cgl", mockTestId: "mt-101", createdAt: new Date(Date.now() - 7200000), resolved: false },
    { id: "m-3", questionSummary: "Which article deals with Right to Equality?", correctAnswer: "Article 14", userAnswer: "Article 19", topic: "Indian Polity", subject: "General Awareness", errorType: "conceptual", examId: "upsc-cse", mockTestId: "mt-100", createdAt: new Date(Date.now() - 86400000), resolved: true, resolvedAt: new Date(Date.now() - 43200000), notes: "Revised fundamental rights chapter" },
  ];

  const examOverlaps: ExamOverlap[] = [
    { topicName: "Percentage & Profit-Loss", topicId: "quant-percentage", sharedExams: [{ examId: "ssc-cgl", examName: "SSC CGL" }, { examId: "ibps-po", examName: "IBPS PO" }, { examId: "rrb-ntpc", examName: "RRB NTPC" }], mastery: "learning", subject: "Quantitative Aptitude" },
    { topicName: "Indian Polity", topicId: "ga-polity", sharedExams: [{ examId: "upsc-cse", examName: "UPSC CSE" }, { examId: "ssc-cgl", examName: "SSC CGL" }, { examId: "state-pcs", examName: "State PCS" }], mastery: "practicing", subject: "General Awareness" },
    { topicName: "Number Series", topicId: "reasoning-series", sharedExams: [{ examId: "ssc-cgl", examName: "SSC CGL" }, { examId: "ibps-po", examName: "IBPS PO" }, { examId: "sbi-po", examName: "SBI PO" }, { examId: "rrb-ntpc", examName: "RRB NTPC" }], mastery: "mastered", subject: "Reasoning" },
  ];

  const today = new Date();
  const streak: StreakDisplay = {
    current: 12, longest: 28, bufferDaysRemaining: 2,
    weekHistory: Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return { day: dayNames[date.getDay()], active: i !== 3, bufferUsed: i === 3, date: date.toISOString().split("T")[0] };
    }),
  };

  const bufferDays: BufferDayInfo = { total: 4, used: 2, remaining: 2, lastUsed: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0] };

  return {
    readiness, todaysOneThing, weakTopics, recentMistakes, examOverlaps, streak, bufferDays,
    studyStats: { todayMinutes: 95, weekMinutes: 840, monthMinutes: 3200, testsThisWeek: 3, cardsReviewed: 47 },
  };
}
