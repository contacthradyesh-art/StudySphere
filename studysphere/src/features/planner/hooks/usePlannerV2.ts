"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { useUserStore } from "@/stores/useUserStore";
import { buildCoachReport, type CoachStats } from "@/lib/planner/ai-coach";
import { buildFocusAnalytics, buildHeatmap, buildSubjectStats, buildTodayTimeline } from "@/lib/planner/analytics";
import { plannerService } from "@/lib/planner/planner-service";
import { subscribeWeeklyPlan } from "@/lib/planner/weekly-plan-service";
import { weekKey } from "@/lib/planner/date-keys";
import type { PomodoroSession } from "@/lib/firestore/pomodoro-schema";
import type { MonthlyGoal, Task, WeeklySlot } from "@/lib/firestore/planner-schema";
import { getCurrentUserId } from "@/utils/getCurrentUserId";

const sessions: PomodoroSession[] = [];

export function usePlannerV2() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { currentStreak, totalXp, level, dailyStudyHours } = useUserStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklySlots, setWeeklySlots] = useState<WeeklySlot[]>([]);
  const [goalItems, setGoalItems] = useState<MonthlyGoal[]>([]);

  const plannerApi = useMemo(() => plannerService(), []);
  const uid = useMemo(() => getCurrentUserId(), []);

  useEffect(() => {
    const unsubscribeTasks = plannerApi.subscribeTasks(setTasks);
    const unsubscribeGoals = plannerApi.subscribeMonthlyPlan(setGoalItems);
    const unsubscribeWeeklyPlan = subscribeWeeklyPlan(uid, (plan) => setWeeklySlots(plan?.slots ?? []), weekKey());

    return () => {
      unsubscribeTasks();
      unsubscribeGoals();
      unsubscribeWeeklyPlan();
    };
  }, [plannerApi, uid]);

  const userName = user?.displayName ?? "Student";
  const focusAnalytics = useMemo(() => buildFocusAnalytics(sessions), []);
  const heatmap = useMemo(() => buildHeatmap(sessions), []);
  const subjectStats = useMemo(() => buildSubjectStats(tasks, sessions), [tasks]);
  const timeline = useMemo(() => buildTodayTimeline(weeklySlots), [weeklySlots]);

  const habitItems = useMemo(() => [
    { id: "habit-1", title: "Complete the highest-priority study block", completed: tasks.some((task) => task.completed) },
    { id: "habit-2", title: "Protect revision coverage", completed: weeklySlots.some((slot) => slot.isRevision) },
    { id: "habit-3", title: "Stay consistent with today's study rhythm", completed: focusAnalytics.completionRate >= 70 },
  ], [focusAnalytics.completionRate, tasks, weeklySlots]);

  const coachStats: CoachStats = {
    streakDays: currentStreak,
    productivityScore: Math.max(40, Math.round((focusAnalytics.completionRate + dailyStudyHours * 7) * 1.8)),
    goalProgress: goalItems.length > 0 ? Math.round((goalItems.filter((goal) => goal.done).length / goalItems.length) * 100) : 0,
    pomodoroCount: sessions.length,
  };

  const coachReport = useMemo(() => buildCoachReport(
    coachStats,
    focusAnalytics,
    subjectStats,
    { todayCompletionPct: Math.round((habitItems.filter((habit) => habit.completed).length / Math.max(habitItems.length, 1)) * 100), habits: habitItems }
  ), [coachStats, focusAnalytics, habitItems, subjectStats]);

  return {
    userName,
    theme,
    currentStreak,
    totalXp,
    level,
    dailyStudyHours,
    weeklySlots,
    tasks,
    goalItems,
    habitItems,
    timeline,
    focusAnalytics,
    heatmap,
    subjectStats,
    coachReport,
    saveWeeklyPlan: plannerApi.saveWeeklyPlan,
    createTask: plannerApi.createTask,
    updateTask: plannerApi.updateTask,
    deleteTask: plannerApi.deleteTask,
  };
}
