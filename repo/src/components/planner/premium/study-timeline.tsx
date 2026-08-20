'use client';

import { motion } from 'framer-motion';
import { Check, Coffee, Sunrise } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { subjectMeta } from '@/lib/planner/subject-meta';
import { cn } from '@/lib/utils';
import type { TimelineBlock } from '@/lib/planner/analytics';

function blockVisual(block: TimelineBlock) {
  if (block.type === 'anchor') return { Icon: Sunrise, color: '#fbbf24' };
  if (block.type === 'break') return { Icon: Coffee, color: '#94a3b8' };
  const meta = subjectMeta(block.subject);
  return { Icon: meta.icon, color: meta.glow };
}

export function StudyTimeline({ blocks }: { blocks: TimelineBlock[] }) {
  return (
    <GlowCard delay={0.1} accent="#6366f1" className="space-y-4">
      <SectionHeading eyebrow="Smart Study Timeline" title="Today's schedule" />

      {blocks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Generate a weekly plan in the AI Smart Planner to see today&apos;s timeline.
        </p>
      ) : (
        <ol className="relative space-y-1 pl-2">
          <div className="absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b from-primary/40 via-white/10 to-transparent" aria-hidden />
          {blocks.map((block, i) => {
            const { Icon, color } = blockVisual(block);
            return (
              <motion.li
                key={block.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative flex items-start gap-3 py-2"
              >
                <span
                  className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-background/80"
                  style={{ boxShadow: `0 0 16px -4px ${color}` }}
                >
                  {block.completed ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Icon className="h-4 w-4" style={{ color }} />
                  )}
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('truncate text-sm font-medium', block.completed && 'text-muted-foreground line-through')}>
                      {block.label}
                    </p>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{block.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {block.durationMinutes}m
                    {block.type === 'revision' && <span className="ml-1.5 text-pink-400">&middot; revision</span>}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
    </GlowCard>
  );
}
