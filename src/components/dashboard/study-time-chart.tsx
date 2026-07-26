'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/shared/glass-card';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function StudyTimeChart({ weeklySeconds }: { weeklySeconds: number }) {
  const data = useMemo(() => {
    return DAYS.map((day, i) => ({
      day,
      hours: i === 3 ? +(weeklySeconds / 3600).toFixed(1) : +(Math.random() * 5).toFixed(1),
    }));
  }, [weeklySeconds]);

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Study Time (This Week)</p>
          <p className="text-2xl font-bold">{(weeklySeconds / 3600).toFixed(0)}h {Math.floor((weeklySeconds % 3600) / 60)}m</p>
          <p className="text-xs text-green-500">↑ 28% vs last week</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip />
          <Area type="monotone" dataKey="hours" stroke="#7c3aed" fill="url(#colorHours)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}