/**
 * AI Study Coach — types and report generation.
 * Derives insights from existing stats without any extra Firestore reads.
 */

import type { FocusAnalytics, SubjectStat } from '@/lib/planner/analytics';

export interface CoachStats {
  streakDays: number;
  productivityScore: number;
  goalProgress: number;
  pomodoroCount: number;
}

export interface HabitInsights {
  todayCompletionPct: number;
  habits: Array<{ id: string; title: string; completed: boolean }>;
}

export interface CoachInsight {
  id: string;
  tone: 'alert' | 'focus' | 'tip';
  message: string;
}

export interface CoachReport {
  insights: CoachInsight[];
  weakSubjects: string[];
  projectedCompletionPct: number;
}

/** Generate a CoachReport from existing derived data — no API call needed. */
export function buildCoachReport(
  stats: CoachStats,
  focus: FocusAnalytics,
  subjects: SubjectStat[],
  habits?: HabitInsights
): CoachReport {
  const insights: CoachInsight[] = [];
  let id = 0;
  const next = (tone: CoachInsight['tone'], message: string) =>
    insights.push({ id: String(id++), tone, message });

  // Streak
  if (stats.streakDays >= 7) {
    next('tip', `🔥 ${stats.streakDays}-day streak! Consistency is your superpower — keep protecting it.`);
  } else if (stats.streakDays === 0) {
    next('alert', 'No active streak. Even 25 minutes today restarts your momentum.');
  } else {
    next('focus', `${stats.streakDays}-day streak active. Push to 7 days for the "On Fire" badge!`);
  }

  // Productivity
  if (stats.productivityScore < 40) {
    next('alert', 'Productivity score is low — many sessions ended early this week. Try shorter 25-min blocks.');
  } else if (stats.productivityScore >= 80) {
    next('tip', `Productivity at ${stats.productivityScore}%! Your focus quality this week is excellent.`);
  }

  // Weekly study time
  const weeklyHours = Math.round(focus.weeklyTotalHours);
  if (weeklyHours < 5) {
    next('alert', `Only ${weeklyHours}h studied this week. Aim for at least 10h to stay on track.`);
  } else if (weeklyHours >= 20) {
    next('tip', `${weeklyHours}h this week — great volume. Schedule a rest day to avoid burnout.`);
  }

  // Best study time
  if (focus.bestHourLabel) {
    next('tip', `Your peak focus time is ${focus.bestHourLabel}. Block this slot daily in your schedule.`);
  }

  // Task completion
  if (stats.goalProgress < 30) {
    next('alert', `Only ${stats.goalProgress}% of tasks completed. Break large tasks into smaller steps.`);
  } else if (stats.goalProgress >= 80) {
    next('focus', `${stats.goalProgress}% tasks done — you're crushing your daily plan!`);
  }

  // Habits
  if (habits) {
    if (habits.todayCompletionPct < 50 && habits.habits.length > 0) {
      next('alert', `Only ${habits.todayCompletionPct}% of today's habits done. Complete them before 9 PM.`);
    } else if (habits.todayCompletionPct === 100 && habits.habits.length > 0) {
      next('tip', '✅ All habits done today! Perfect execution builds unbeatable discipline.');
    }
  }

  // Subjects
  const weakSubjects = subjects
    .filter((s) => s.trendPct < 0 || (s.tasksTotal > 0 && s.progressPct < 40))
    .map((s) => s.subject);

  if (weakSubjects.length > 0) {
    next('alert', `Weak subjects detected: ${weakSubjects.slice(0, 3).join(', ')}. Allocate extra time this week.`);
  }

  // Pomodoros
  if (stats.pomodoroCount === 0) {
    next('focus', 'No focus sessions today yet. Start a 25-minute Pomodoro to build momentum.');
  }

  return {
    insights: insights.slice(0, 5), // max 5 cards
    weakSubjects,
    projectedCompletionPct: focus.completionRate
  };
}
