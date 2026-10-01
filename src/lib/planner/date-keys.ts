/**
 * Stable Firestore document keys for time-bucketed planner data.
 *   weekKey  -> ISO week, e.g. "2026-W24" (doc id for weeklyPlan)
 *   monthKey -> "YYYY-MM"   (doc id for monthlyPlan)
 */

/** ISO-8601 week key (weeks start Monday; week 1 contains the first Thursday). */
export function weekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Thursday in current week decides the year.
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Month key "YYYY-MM". */
export function monthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Local-calendar date key in YYYY-MM-DD format. */
export function toDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Parse an existing YYYY-MM-DD planner key as a local-time Date. */
export function parseDateKey(key: string): Date {
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(key);
  if (!match) throw new Error(`Invalid planner date key: ${key}`);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
