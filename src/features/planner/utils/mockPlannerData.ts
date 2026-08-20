import type { DailyPlan, WeeklyPlan, Mission, PlanTask } from "../types";

function getDateString(offset: number): string {
  const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().split("T")[0];
}
function getDayLabel(offset: number): string {
  const d = new Date(); d.setDate(d.getDate() + offset);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[d.getDay()];
}

export function getMockWeeklyPlan(): WeeklyPlan {
  const days: DailyPlan[] = Array.from({ length: 7 }).map((_, i) => {
    const isBufferDay = i === 3;
    const isToday = i === 0;
    const tasks: PlanTask[] = isBufferDay
      ? [{ id: `t-${i}-1`, title: "Buffer Day - Light Revision", type: "revision", subject: "quantitative-aptitude", durationMinutes: 30, date: getDateString(i), status: "pending", priority: "low", isBufferDay: true, isAiSuggested: false }]
      : [
          { id: `t-${i}-1`, title: i % 2 === 0 ? "Quantitative Aptitude - Percentage" : "Reasoning - Syllogism", type: "study", subject: i % 2 === 0 ? "quantitative-aptitude" : "reasoning", topic: i % 2 === 0 ? "Percentage" : "Syllogism", durationMinutes: 60, date: getDateString(i), startTime: "09:00", status: isToday && i === 0 ? "completed" : "pending", priority: "high", isBufferDay: false, isAiSuggested: true },
          { id: `t-${i}-2`, title: "Flashcard Review", type: "flashcard-review", durationMinutes: 20, date: getDateString(i), startTime: "10:15", status: isToday ? "in-progress" : "pending", priority: "medium", isBufferDay: false, isAiSuggested: true },
          { id: `t-${i}-3`, title: i % 3 === 0 ? "Full Mock Test" : "Speed Drill", type: "mock-test", durationMinutes: i % 3 === 0 ? 60 : 15, date: getDateString(i), startTime: "14:00", status: "pending", priority: i % 3 === 0 ? "high" : "medium", isBufferDay: false, isAiSuggested: false },
          { id: `t-${i}-4`, title: "General Awareness - Current Affairs", type: "study", subject: "general-awareness", topic: "Current Affairs", durationMinutes: 30, date: getDateString(i), startTime: "16:00", status: "pending", priority: "medium", isBufferDay: false, isAiSuggested: true },
          { id: `t-${i}-5`, title: "Revision - Weak Topics", type: "revision", durationMinutes: 30, date: getDateString(i), startTime: "19:00", status: "pending", priority: "high", isBufferDay: false, isAiSuggested: true },
        ];
    const totalMinutes = tasks.reduce((s, t) => s + t.durationMinutes, 0);
    const completedMinutes = tasks.filter((t) => t.status === "completed").reduce((s, t) => s + t.durationMinutes, 0);
    return { date: getDateString(i), dayLabel: i === 0 ? "Today" : i === 1 ? "Tomorrow" : getDayLabel(i), tasks, totalMinutes, completedMinutes, isBufferDay, isToday };
  });
  const totalTasks = days.reduce((s, d) => s + d.tasks.length, 0);
  const completedTasks = days.reduce((s, d) => s + d.tasks.filter((t) => t.status === "completed").length, 0);
  return { weekStart: getDateString(0), weekEnd: getDateString(6), days, totalTasks, completedTasks };
}

export function getMockMissions(): Mission[] {
  return [
    { id: "mission-ssc", title: "SSC CGL 2025 Preparation", description: "Complete syllabus coverage and 20 mock tests before exam", examId: "ssc-cgl", targetDate: "2025-06-15", progress: 35, status: "active",
      milestones: [
        { id: "ms-1", title: "Complete Quant Basics", targetDate: "2025-02-28", completed: true, tasks: ["Percentage", "Profit & Loss", "CI/SI"] },
        { id: "ms-2", title: "Complete Reasoning", targetDate: "2025-03-31", completed: false, tasks: ["Syllogism", "Coding", "Series", "Puzzles"] },
        { id: "ms-3", title: "10 Full Mocks", targetDate: "2025-05-15", completed: false, tasks: ["Mock 1-10 with analysis"] },
        { id: "ms-4", title: "Final Revision", targetDate: "2025-06-10", completed: false, tasks: ["Weak topics", "Formula revision"] },
      ] },
    { id: "mission-ibps", title: "IBPS PO 2025", description: "Focus on Reasoning Puzzles and Quant DI", examId: "ibps-po", targetDate: "2025-10-20", progress: 15, status: "active",
      milestones: [
        { id: "ms-i1", title: "Prelims Syllabus", targetDate: "2025-07-31", completed: false, tasks: ["Quant", "Reasoning", "English"] },
        { id: "ms-i2", title: "Mains Preparation", targetDate: "2025-09-30", completed: false, tasks: ["DI", "Puzzles", "RC", "GA"] },
      ] },
  ];
}
