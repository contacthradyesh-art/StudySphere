import type { PomodoroSession } from '@/lib/firestore/pomodoro-schema';

function toDate(s: PomodoroSession): Date | null {
  // endedAt is a Firestore Timestamp; guard for optimistic/local records.
  const ts = s.endedAt as unknown as { toDate?: () => Date } | null;
  return ts?.toDate ? ts.toDate() : null;
}

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

export interface SessionStatsSummary {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  todayFocusSeconds: number;
}

/** Aggregate completed focus sessions into day/week/month counts. */
export function summarizeSessions(sessions: PomodoroSession[]): SessionStatsSummary {
  const now = new Date();
  const today = startOfDay(now);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 6);
  const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 29);

  let todayCount = 0, weekCount = 0, monthCount = 0, todayFocusSeconds = 0;
  for (const s of sessions) {
    if (s.phase !== 'focus' || !s.completed) continue;
    const d = toDate(s);
    if (!d) continue;
    if (d >= monthAgo) monthCount += 1;
    if (d >= weekAgo) weekCount += 1;
    if (d >= today) { todayCount += 1; todayFocusSeconds += s.completedSeconds; }
  }
  return { todayCount, weekCount, monthCount, todayFocusSeconds };
}

export interface DailyHistoryPoint {
  /** ISO date YYYY-MM-DD */
  date: string;
  /** Short weekday label, e.g. "Mon". */
  label: string;
  focusMinutes: number;
  sessions: number;
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Build a per-day history of focus minutes and session counts for the last
 * `days` days (inclusive of today), oldest first. Days with no sessions are
 * included as zero so the chart shows a continuous axis.
 */
export function dailyFocusHistory(sessions: PomodoroSession[], days = 7): DailyHistoryPoint[] {
  const today = startOfDay(new Date());
  const buckets = new Map<string, { focusSeconds: number; sessions: number }>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), { focusSeconds: 0, sessions: 0 });
  }

  for (const s of sessions) {
    if (s.phase !== 'focus' || !s.completed) continue;
    const d = toDate(s);
    if (!d) continue;
    const key = startOfDay(d).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue; // outside the window
    bucket.focusSeconds += s.completedSeconds;
    bucket.sessions += 1;
  }

  return Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    label: WEEKDAY[new Date(`${date}T00:00:00`).getDay()],
    focusMinutes: Math.round(v.focusSeconds / 60),
    sessions: v.sessions
  }));
}
