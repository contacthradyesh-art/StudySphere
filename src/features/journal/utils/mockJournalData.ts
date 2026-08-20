import type { JournalEntry, JournalStats } from "../types";

export function getMockJournalEntries(): JournalEntry[] {
  return [
    { id: "j1", questionText: "If CP of 15 articles = SP of 12 articles, find profit%?", correctAnswer: "25%", userAnswer: "20%", topic: "Profit & Loss", subject: "quantitative-aptitude", errorType: "silly", examId: "ssc-cgl", mockTestId: "mt-101", notes: "Forgot to use CP as base for percentage", resolved: false, createdAt: new Date(Date.now() - 3600000) },
    { id: "j2", questionText: "All cats are animals. Some animals are dogs. Conclusion?", correctAnswer: "No definite conclusion about cats and dogs", userAnswer: "Some cats are dogs", topic: "Syllogism", subject: "reasoning", errorType: "conceptual", examId: "ssc-cgl", notes: "Need to revise Venn diagram method", resolved: false, createdAt: new Date(Date.now() - 7200000) },
    { id: "j3", questionText: "Which article deals with Right to Equality?", correctAnswer: "Article 14", userAnswer: "Article 19", topic: "Indian Polity", subject: "general-awareness", errorType: "conceptual", examId: "upsc-cse", notes: "Revised fundamental rights chapter", resolved: true, resolvedAt: new Date(Date.now() - 43200000), createdAt: new Date(Date.now() - 86400000) },
    { id: "j4", questionText: "Train 150m long passes pole in 15s. Speed in km/hr?", correctAnswer: "36 km/hr", userAnswer: "40 km/hr", topic: "Time, Speed & Distance", subject: "quantitative-aptitude", errorType: "silly", examId: "ssc-cgl", notes: "Conversion error: forgot 18/5 factor", resolved: false, createdAt: new Date(Date.now() - 172800000) },
    { id: "j5", questionText: "42nd Amendment is known as?", correctAnswer: "Mini Constitution", userAnswer: "Grand Amendment", topic: "Indian Polity", subject: "general-awareness", errorType: "guessing", examId: "ssc-cgl", notes: "", resolved: true, resolvedAt: new Date(Date.now() - 86400000), createdAt: new Date(Date.now() - 259200000) },
    { id: "j6", questionText: "CI on Rs 5000 at 10% for 2 years?", correctAnswer: "Rs 1050", userAnswer: "Rs 1000", topic: "Compound Interest", subject: "quantitative-aptitude", errorType: "time-pressure", examId: "ibps-po", notes: "Used SI formula instead of CI under time pressure", resolved: false, createdAt: new Date(Date.now() - 345600000) },
  ];
}

export function getJournalStats(entries: JournalEntry[]): JournalStats {
  const resolved = entries.filter((e) => e.resolved).length;
  const byErrorType = {
    conceptual: entries.filter((e) => e.errorType === "conceptual").length,
    silly: entries.filter((e) => e.errorType === "silly").length,
    "time-pressure": entries.filter((e) => e.errorType === "time-pressure").length,
    guessing: entries.filter((e) => e.errorType === "guessing").length,
  };
  const topicCounts = new Map<string, number>();
  entries.forEach((e) => { topicCounts.set(e.topic, (topicCounts.get(e.topic) || 0) + 1); });
  const topWeakTopics = Array.from(topicCounts.entries()).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  return { total: entries.length, resolved, unresolved: entries.length - resolved, byErrorType, topWeakTopics };
}
