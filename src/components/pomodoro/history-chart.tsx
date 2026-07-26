'use client';

import { useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { GlassCard } from '@/components/shared/glass-card';
import { dailyFocusHistory } from '@/lib/pomodoro/stats';
import { cn } from '@/lib/utils';
import type { PomodoroSession } from '@/lib/firestore/pomodoro-schema';

type Range = 7 | 30;

/** Bar chart of focus minutes per day over the last week or month. */
export function PomodoroHistoryChart({ sessions }: { sessions: PomodoroSession[] }) {
  const [range, setRange] = useState<Range>(7);
  const data = useMemo(() => dailyFocusHistory(sessions, range), [sessions, range]);
  const total = useMemo(() => data.reduce((a, d) => a + d.focusMinutes, 0), [data]);

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Focus history</h2>
          <p className="text-xs text-muted-foreground">{total} min over the last {range} days</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {([7, 30] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                range === r ? 'bg-gradient-brand text-white' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r === 7 ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
            <XAxis
              dataKey={range === 7 ? 'label' : 'date'}
              tick={{ fontSize: 11 }}
              tickFormatter={range === 30 ? (v: string) => v.slice(5) : undefined}
              interval={range === 30 ? 4 : 0}
              stroke="currentColor"
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'rgba(127,127,127,0.1)' }}
              contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: 12 }}
              formatter={(value: number) => [`${value} min`, 'Focus']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
            />
            <Bar dataKey="focusMinutes" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
