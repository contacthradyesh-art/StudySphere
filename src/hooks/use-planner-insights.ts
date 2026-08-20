import { useMemo } from 'react';
import { usePlannerStore } from '@/store/planner-store';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useGamification } from '@/hooks/use-gamification';

export function usePlannerInsights() {
  const tasks = usePlannerStore((s) => s.tasks);

  const { stats } = useDashboardStats();
  const gamification = useGamification(stats.streakDays);

  const today = new Date().toISOString().split('T')[0];

  const tasksToday = tasks.filter(
    (t) => t.dueDate === today
  );

  const tasksTodayDone = tasksToday.filter(
    (t) => t.completed
  ).length;

  return useMemo(
    () => ({
      tasksToday,
      tasksTodayDone,
      missionPct:
        tasksToday.length === 0
          ? 0
          : Math.round((tasksTodayDone / tasksToday.length) * 100),

      focusScore: stats.productivityScore,

      dashboardStats: stats,

      gamification,
    }),
    [
      tasksToday,
      tasksTodayDone,
      stats,
      gamification,
    ]
  );
}