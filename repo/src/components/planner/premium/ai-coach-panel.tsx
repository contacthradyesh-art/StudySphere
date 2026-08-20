'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, Sparkle, Target } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import type { CoachInsight, CoachReport } from '@/lib/planner/ai-coach';

const TONE_STYLE: Record<CoachInsight['tone'], { icon: typeof AlertTriangle; classes: string }> = {
  alert: { icon: AlertTriangle, classes: 'border-amber-400/30 bg-amber-400/10 text-amber-300' },
  focus: { icon: Target, classes: 'border-primary/30 bg-primary/10 text-primary' },
  tip: { icon: Lightbulb, classes: 'border-sky-400/30 bg-sky-400/10 text-sky-300' }
};

export function AiCoachPanel({ report }: { report: CoachReport }) {
  return (
    <GlowCard delay={0.15} accent="#a78bfa" className="space-y-4">
      <SectionHeading
        eyebrow="AI Study Coach"
        title="Recommendations"
        action={<Sparkle className="h-5 w-5 text-fuchsia-400" />}
      />

      <div className="space-y-2">
        {report.insights.map((insight, i) => {
          const { icon: Icon, classes } = TONE_STYLE[insight.tone];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm ${classes}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-foreground/90">{insight.message}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-muted-foreground">Weak subjects</p>
          <p className="mt-1 text-sm font-semibold">
            {report.weakSubjects.length > 0 ? report.weakSubjects.join(', ') : 'None right now'}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-muted-foreground">Projected completion</p>
          <p className="mt-1 text-sm font-semibold">{report.projectedCompletionPct}% of weekly plan</p>
        </div>
      </div>
    </GlowCard>
  );
}
