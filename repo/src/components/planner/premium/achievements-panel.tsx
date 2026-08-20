'use client';

import { motion } from 'framer-motion';
import { Lock, Trophy } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { cn } from '@/lib/utils';
import { BADGES } from '@/lib/gamification/xp';
import type { Gamification } from '@/hooks/use-gamification';

export function AchievementsPanel({ gamification }: { gamification: Gamification }) {
  const earnedIds = new Set(gamification.badges.map((b) => b.id));

  return (
    <GlowCard delay={0.1} accent="#fbbf24" className="space-y-4">
      <SectionHeading
        eyebrow="Achievements"
        title={`Level ${gamification.level.level} \u00b7 ${gamification.profile.totalXp} XP`}
        action={<Trophy className="h-5 w-5 text-amber-300" />}
      />

      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-gradient-brand"
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(gamification.level.progress * 100)}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {gamification.level.xpIntoLevel} / {gamification.level.xpForNext} XP to level {gamification.level.level + 1}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {BADGES.map((badge, i) => {
          const earned = earnedIds.has(badge.id);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={earned ? { scale: 1.04 } : undefined}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center',
                earned ? 'border-amber-400/40 bg-amber-400/10' : 'border-white/10 bg-white/5 opacity-60'
              )}
            >
              <span className="text-2xl">{earned ? badge.emoji : <Lock className="mx-auto h-5 w-5 text-muted-foreground" />}</span>
              <p className="text-xs font-semibold">{badge.label}</p>
              <p className="text-[11px] text-muted-foreground">{badge.description}</p>
            </motion.div>
          );
        })}
      </div>
    </GlowCard>
  );
}
