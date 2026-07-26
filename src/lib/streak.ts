/**
 * Shared streak-counting utility (Foundation Phase).
 *
 * Extracted verbatim from `use-dashboard-stats.ts` so the existing pomodoro
 * streak and the new habit streaks both use one implementation — no
 * duplicated streak logic. Behavior is unchanged from the original.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDayMs(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/**
 * Count consecutive days (ending today) present in `activeDays`. Today not
 * being present yet does not break the streak unless yesterday is also
 * missing (e.g. user hasn't logged today, but did log every day up to and
 * including yesterday).
 *
 * `activeDays` must contain start-of-day millisecond timestamps (use
 * `startOfDayMs` to build it).
 */
export function computeStreak(activeDays: Set<number>): number {
  const today = startOfDayMs(new Date());
  let streak = 0;
  let cursor = activeDays.has(today) ? today : today - DAY_MS;
  while (activeDays.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}
