'use client';

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileLevelCardProps {
  name: string;
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  streakDays: number;
  className?: string;
}

/** Compact level/XP summary shown in the sidebar. Uses placeholder math until a real XP ledger exists. */
export function ProfileLevelCard({ name, level, title, xp, xpToNext, streakDays, className }: ProfileLevelCardProps) {
  const pct = xpToNext > 0 ? Math.min(100, Math.round((xp / xpToNext) * 100)) : 0;

  return (
    <div className={cn('glass space-y-3 rounded-2xl p-4', className)}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-sm font-bold text-white">
          {level}
        </span>
        <div>
          <p className="text-xs text-muted-foreground">Level {level}</p>
          <p className="text-sm font-semibold">{title}</p>
        </div>
      </div>

      <div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        <span>{streakDays} Day Streak</span>
      </div>
    </div>
  );
}