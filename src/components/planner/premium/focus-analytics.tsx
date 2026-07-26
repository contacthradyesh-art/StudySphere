'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Clock3, Gauge, ListChecks, Trophy } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { subjectMeta } from '@/lib/planner/subject-meta';
import type { FocusAnalytics as FocusAnalyticsData } from '@/lib/planner/analytics';

export function FocusAnalytics({ data }: { data: FocusAnalyticsData }) {
  const meta = data.mostProductiveSubject ? subjectMeta(data.mostProductiveSubject) : null;

  return (
    <GlowCard delay={0.2} accent="#818cf8" className="space-y-4">
      <SectionHeading eyebrow="Focus Analytics" title="This week" />

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.weeklySeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" stroke="currentColor" className="text-xs text-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis stroke="currentColor" className="text-xs text-muted-foreground" tickLine={false} axisLine={false} width={28} />
            <Tooltip
              cursor={{ fill: 'rgba(139,92,246,0.08)' }}
              contentStyle={{ background: 'rgba(15,15,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              formatter={(value: number) => [`${value}h`, 'Studied']}
            />
            <Bar dataKey="hours" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
          {meta ? <meta.icon className="h-4 w-4 shrink-0" style={{ color: meta.glow }} /> : <Trophy className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Most productive</p>
            <p className="truncate text-sm font-semibold">{data.mostProductiveSubject ?? 'Not enough data'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <Clock3 className="h-4 w-4 shrink-0 text-sky-300" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Best study time</p>
            <p className="truncate text-sm font-semibold">{data.bestHourLabel ?? 'Not enough data'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <Gauge className="h-4 w-4 shrink-0 text-violet-300" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Weekly hours</p>
            <p className="truncate text-sm font-semibold">{data.weeklyTotalHours}h</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <ListChecks className="h-4 w-4 shrink-0 text-emerald-300" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Completion rate</p>
            <p className="truncate text-sm font-semibold">{data.completionRate}%</p>
          </div>
        </div>
      </div>
    </GlowCard>
  );
}
