import type { JournalEntry, Mood } from '@/lib/firestore/journal-schema';

export interface JournalStatsSummary {
  totalEntries: number;
  currentStreak: number;
  moodCounts: Record<Mood, number>;
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}
function prevIso(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Compute total entries, consecutive-day streak and mood distribution. */
export function summarizeJournal(entries: JournalEntry[]): JournalStatsSummary {
  const moodCounts: Record<Mood, number> = { great: 0, good: 0, okay: 0, low: 0, bad: 0 };
  const dates = new Set<string>();
  for (const e of entries) {
    dates.add(e.date);
    if (e.mood) moodCounts[e.mood] += 1;
  }

  // Streak: count back from today (or yesterday) while entries exist.
  let streak = 0;
  let cursor = dates.has(isoToday()) ? isoToday() : prevIso(isoToday());
  while (dates.has(cursor)) {
    streak += 1;
    cursor = prevIso(cursor);
  }

  return { totalEntries: entries.length, currentStreak: streak, moodCounts };
}
