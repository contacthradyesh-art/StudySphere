'use client';

import { StatCard } from '@/components/shared/stat-card';
import { CalendarDays, CalendarRange, Clock, Timer } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import type { SessionStatsSummary } from '@/lib/pomodoro/stats';

/** Grid of Pomodoro statistic cards. */
export function SessionStats({ stats }: { stats: SessionStatsSummary }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Today" value={`${stats.todayCount}`} icon={Timer} hint="Focus sessions" />
      <StatCard label="Focus time today" value={formatDuration(stats.todayFocusSeconds)} icon={Clock} />
      <StatCard label="This week" value={`${stats.weekCount}`} icon={CalendarRange} hint="Sessions" />
      <StatCard label="This month" value={`${stats.monthCount}`} icon={CalendarDays} hint="Sessions" />
    </div>
  );
}
