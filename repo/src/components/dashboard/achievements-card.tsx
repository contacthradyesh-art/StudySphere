'use client';

import { GlassCard } from '@/components/shared/glass-card';
import Link from 'next/link';

const achievements = [
  { icon: '🌅', title: 'Early Bird', desc: 'Study before 7 AM', earned: true },
  { icon: '🎯', title: 'Focus Master', desc: '50 Deep Focus Sessions', earned: true },
  { icon: '⚔️', title: 'Week Warrior', desc: '7 Day Streak', earned: true },
  { icon: '🦉', title: 'Night Owl', desc: 'Study after 10 PM', earned: true },
  { icon: '🔥', title: 'Consistent', desc: '14 Day Streak', earned: true },
];

export function AchievementsCard() {
  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Achievements</h2>
        <Link href="/dashboard" className="text-xs text-primary hover:underline">View All</Link>
      </div>
      <div className="space-y-3">
        {achievements.map((a) => (
          <div key={a.title} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-xl">
              {a.icon}
            </div>
            <div>
              <p className="text-sm font-medium">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}