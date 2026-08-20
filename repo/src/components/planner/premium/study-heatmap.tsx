'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { currentHeatmapStreak, type HeatmapDay } from '@/lib/planner/analytics';
import { formatDuration } from '@/lib/utils';

const LEVEL_COLOR: Record<HeatmapDay['level'], string> = {
  0: 'bg-white/5',
  1: 'bg-primary/25',
  2: 'bg-primary/45',
  3: 'bg-primary/70',
  4: 'bg-primary'
};

export function StudyHeatmap({ days }: { days: HeatmapDay[] }) {
  const streak = currentHeatmapStreak(days);
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <GlowCard delay={0.15} accent="#f472b6" className="space-y-4">
      <SectionHeading
        eyebrow="Study Heatmap"
        title="Last 30 days"
        action={
          <span className="flex items-center gap-1 text-sm font-semibold text-amber-300">
            <Flame className="h-4 w-4" /> {streak}d
          </span>
        }
      />

      <div className="flex justify-center gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            {week.map((day, di) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (wi * 7 + di) * 0.008 }}
                whileHover={{ scale: 1.25 }}
                title={`${day.date}: ${formatDuration(day.seconds)}`}
                className={`h-3.5 w-3.5 rounded-[4px] ${LEVEL_COLOR[day.level]}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {([0, 1, 2, 3, 4] as const).map((lvl) => (
          <span key={lvl} className={`h-3 w-3 rounded-[3px] ${LEVEL_COLOR[lvl]}`} />
        ))}
        <span>More</span>
      </div>
    </GlowCard>
  );
}
