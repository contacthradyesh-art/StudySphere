'use client';

import { GlassCard } from '@/components/shared/glass-card';
import { MOODS } from '@/lib/firestore/journal-schema';
import type { JournalStatsSummary } from '@/lib/journal/stats';
import type { Mood } from '@/lib/firestore/journal-schema';

interface JournalStatsProps {
  stats: JournalStatsSummary;
  todayMood?: Mood | null;
  onMoodSelect?: (mood: Mood) => void;
}

export function JournalStats({ stats, todayMood, onMoodSelect }: JournalStatsProps) {
  const totalMoods = Object.values(stats.moodCounts).reduce((a, b) => a + b, 0) || 1;

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

    </div>
  );
}