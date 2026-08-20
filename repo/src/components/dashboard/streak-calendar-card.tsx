'use client';

import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import { Flame, ChevronLeft, ChevronRight, X, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Goal {
  id: string;
  text: string;
  done: boolean;
}

type DayGoals = Record<string, Goal[]>;

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const STORAGE_KEY = 'goal-tracker-v1';

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function loadData(): DayGoals {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DayGoals;
  } catch {
    /* ignore */
  }
  return {};
}

function saveData(data: DayGoals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function completionRatio(goals: Goal[] | undefined): number {
  if (!goals || goals.length === 0) return 0;
  const done = goals.filter((g) => g.done).length;
  return done / goals.length;
}

function isDayComplete(goals: Goal[] | undefined): boolean {
  return !!goals && goals.length > 0 && goals.every((g) => g.done);
}

function computeStreak(data: DayGoals): number {
  let streak = 0;
  const cursor = new Date();
  if (!isDayComplete(data[toKey(cursor)])) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (isDayComplete(data[toKey(cursor)])) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function heatClass(ratio: number): string {
  if (ratio === 0) return 'bg-secondary/60 hover:bg-secondary';
  if (ratio < 0.5) return 'bg-primary/40 hover:opacity-80';
  if (ratio < 1) return 'bg-primary/70 hover:opacity-80';
  return 'bg-gradient-brand hover:opacity-80';
}

export function StreakCalendarCard({ delay }: { delay?: number }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState<DayGoals>({});
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [newGoalText, setNewGoalText] = useState('');

  useEffect(() => {
    setData(loadData());
  }, []);

  const persist = useCallback((next: DayGoals) => {
    setData(next);
    saveData(next);
  }, []);

  const streakDays = useMemo(() => computeStreak(data), [data]);
  const todayKey = useMemo(() => toKey(new Date()), []);

  const weeks = useMemo(() => {
    const today = new Date();
    const dow = (today.getDay() + 6) % 7;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - dow + weekOffset * 7);

    const grid: { date: Date; key: string; dayNum: number; ratio: number; future: boolean; isToday: boolean }[][] = [];
    for (let w = 3; w >= 0; w--) {
      const row: { date: Date; key: string; dayNum: number; ratio: number; future: boolean; isToday: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(thisMonday);
        day.setDate(thisMonday.getDate() - w * 7 + d);
        const key = toKey(day);
        row.push({
          date: day,
          key,
          dayNum: day.getDate(),
          ratio: completionRatio(data[key]),
          future: day > today,
          isToday: key === todayKey,
        });
      }
      grid.push(row);
    }
    return grid;
  }, [data, weekOffset, todayKey]);

  const monthLabel = useMemo(() => {
    const lastDay = weeks[weeks.length - 1]?.[6]?.date ?? new Date();
    return lastDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, [weeks]);

  const openGoals = openDay ? data[openDay] ?? [] : [];

  function addGoal() {
    const text = newGoalText.trim();
    if (!text || !openDay) return;
    const next = { ...data, [openDay]: [...(data[openDay] ?? []), { id: crypto.randomUUID(), text, done: false }] };
    persist(next);
    setNewGoalText('');
  }

  function toggleGoal(goalId: string) {
    if (!openDay) return;
    const next = {
      ...data,
      [openDay]: (data[openDay] ?? []).map((g) => (g.id === goalId ? { ...g, done: !g.done } : g)),
    };
    persist(next);
  }

  function deleteGoal(goalId: string) {
    if (!openDay) return;
    const next = { ...data, [openDay]: (data[openDay] ?? []).filter((g) => g.id !== goalId) };
    persist(next);
  }

  return (
    <>
      <GlassCard delay={delay} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Goal Tracker</h3>
            <p className="text-xs text-muted-foreground">{monthLabel}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setWeekOffset((o) => o - 4)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setWeekOffset((o) => Math.min(0, o + 4))}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30"
              disabled={weekOffset >= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>{streakDays} Days</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {WEEK_LABELS.map((label, i) => (
            <span key={i} className="text-center text-[11px] text-muted-foreground">
              {label}
            </span>
          ))}
          {weeks.flat().map((cell) => (
            <button
              key={cell.key}
              type="button"
              title={cell.key}
              onClick={() => !cell.future && setOpenDay(cell.key)}
              disabled={cell.future}
              className={cn(
                'relative aspect-square rounded-md text-[10px] font-medium transition-colors',
                cell.future ? 'cursor-default bg-transparent text-transparent' : heatClass(cell.ratio),
                cell.ratio >= 0.5 && !cell.future ? 'text-white' : 'text-muted-foreground',
                cell.isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              )}
            >
              {!cell.future && cell.dayNum}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-sm bg-secondary/60" />
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/70" />
          <div className="h-2.5 w-2.5 rounded-sm bg-gradient-brand" />
          <span>More</span>
        </div>
      </GlassCard>

      {openDay && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setOpenDay(null)}
        >
          <div
            className="glass w-full max-w-sm space-y-4 rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {new Date(openDay).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button onClick={() => setOpenDay(null)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto">
              {openGoals.length === 0 && (
                <p className="text-sm text-muted-foreground">No goals yet for this day.</p>
              )}
              {openGoals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                  <button
                    onClick={() => toggleGoal(goal.id)}
                    className={cn(
                      'grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors',
                      goal.done ? 'border-primary bg-gradient-brand' : 'border-muted-foreground'
                    )}
                    aria-label={goal.done ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {goal.done && <span className="h-2 w-2 rounded-full bg-white" />}
                  </button>
                  <span className={cn('flex-1 text-sm', goal.done && 'text-muted-foreground line-through')}>
                    {goal.text}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    aria-label="Delete goal"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addGoal();
              }}
              className="flex gap-2"
            >
              <input
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="e.g. Study 2 hours"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-brand text-white"
                aria-label="Add goal"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}