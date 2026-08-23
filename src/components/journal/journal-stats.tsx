'use client';

import { GlassCard } from '@/components/shared/glass-card';
import { MOODS } from '@/lib/firestore/journal-schema';
import type { JournalStatsSummary } from '@/lib/journal/stats';
import type { JournalEntry, Mood } from '@/lib/firestore/journal-schema';

interface JournalStatsProps {
  stats: JournalStatsSummary;
  todayMood?: Mood | null;
  onMoodSelect?: (mood: Mood) => void;
  /** All entries — used to render the last-14-days mood trend. Optional so
      existing callers that only pass `stats` keep compiling. */
  entries?: JournalEntry[];
}

// Rough "how good" ordering so the trend bars read top-to-bottom as
// good-to-bad, not just a random color key.
const MOOD_HEIGHT: Record<Mood, number> = { great: 100, good: 75, okay: 50, low: 25, bad: 10 };
const MOOD_COLOR: Record<Mood, string> = {
  great: 'bg-emerald-400', good: 'bg-lime-400', okay: 'bg-amber-400', low: 'bg-orange-400', bad: 'bg-rose-500',
};

function last14Days(entries: JournalEntry[]) {
  const byDate = new Map(entries.map((e) => [e.date, e]));
  const days: { iso: string; label: string; mood: Mood | null }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ iso, label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), mood: byDate.get(iso)?.mood ?? null });
  }
  return days;
}

export function JournalStats({ stats, todayMood, onMoodSelect, entries }: JournalStatsProps) {
  const totalMoods = Object.values(stats.moodCounts).reduce((a, b) => a + b, 0) || 1;
  const trend = entries ? last14Days(entries) : [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

      {/* Today's Mood */}
      <GlassCard className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">Today's Mood</span>
        <div className="flex gap-2 flex-wrap">
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onMoodSelect?.(m.id)}
              title={m.label}
              aria-label={m.label}
              className={`grid h-11 w-11 place-items-center rounded-xl border text-xl transition-all
                ${todayMood === m.id
                  ? 'border-primary bg-primary/15 scale-110'
                  : 'border-input hover:bg-accent'
                }`}
            >
              {m.emoji}
            </button>
          ))}
        </div>
        {todayMood && (
          <span className="text-xs text-muted-foreground">
            {MOODS.find(m => m.id === todayMood)?.label}
          </span>
        )}
      </GlassCard>

      {/* Current Streak */}
      <GlassCard className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Current streak</span>
        <div className="flex items-center gap-2">
          <span className="text-3xl">🔥</span>
          <span className="text-2xl font-bold">
            {stats.currentStreak} day{stats.currentStreak === 1 ? '' : 's'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">Keep it up!</span>
      </GlassCard>

      {/* Mood Mix */}
      <GlassCard className="sm:col-span-1">
        <span className="text-sm text-muted-foreground">Mood mix</span>
        <div className="mt-2 space-y-1">
          {MOODS.map((m) => {
            const pct = Math.round((stats.moodCounts[m.id] / totalMoods) * 100);
            return (
              <div key={m.id} className="flex items-center gap-2 text-xs">
                <span>{m.emoji}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-brand transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* 14-day mood trend — the mix card shows overall proportions but hides
          direction of change; this makes "am I trending up or down lately"
          answerable at a glance, which matters more for someone using this
          during exam prep stress. */}
      {entries && (
        <GlassCard className="sm:col-span-3">
          <span className="text-sm text-muted-foreground">Last 14 days</span>
          <div className="mt-3 flex items-end justify-between gap-1.5" style={{ height: 64 }}>
            {trend.map((d) => (
              <div key={d.iso} className="flex flex-1 flex-col items-center gap-1" title={d.iso}>
                <div className="flex h-12 w-full items-end overflow-hidden rounded-sm bg-muted/50">
                  {d.mood && (
                    <div
                      className={`w-full rounded-sm ${MOOD_COLOR[d.mood]}`}
                      style={{ height: `${MOOD_HEIGHT[d.mood]}%` }}
                    />
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

    </div>
  );
}