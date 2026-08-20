'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { subjectMeta } from '@/lib/planner/subject-meta';
import type { SubjectStat } from '@/lib/planner/analytics';

export function SubjectProgress({ subjects }: { subjects: SubjectStat[] }) {
  return (
    <GlowCard delay={0.2} accent="#ec4899" className="space-y-4">
      <SectionHeading eyebrow="Subject Progress" title="Where your hours go" />

      {subjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Complete tasks or focus sessions tagged with a subject to see progress here.</p>
      ) : (
        <div className="space-y-3">
          {subjects.map((s, i) => {
            const meta = subjectMeta(s.subject);
            const Icon = meta.icon;
            const trendUp = s.trendPct >= 0;
            return (
              <motion.div
                key={s.subject}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4" style={{ color: meta.glow }} />
                    {s.subject}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {s.hoursThisWeek}h this week
                    {s.hoursLastWeek > 0 && (
                      <span className={trendUp ? 'flex items-center gap-0.5 text-emerald-400' : 'flex items-center gap-0.5 text-rose-400'}>
                        {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(s.trendPct)}%
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${meta.glow}, #8b5cf6)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.progressPct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{s.tasksDone}/{s.tasksTotal} tasks &middot; {s.progressPct}% done</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </GlowCard>
  );
}
