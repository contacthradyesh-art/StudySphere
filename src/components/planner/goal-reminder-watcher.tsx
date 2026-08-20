'use client';

import { useGoalReminders } from '@/hooks/use-goal-reminders';

/** Renders nothing — just keeps the goal-reminder alarm engine running app-wide. */
export function GoalReminderWatcher() {
  useGoalReminders();
  return null;
}