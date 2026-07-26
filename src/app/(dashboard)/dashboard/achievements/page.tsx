'use client';

import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { useGamification } from '@/hooks/use-gamification';
import { BADGES } from '@/lib/gamification/xp';
import { requestNotificationPermission, notificationsSupported, showReminder } from '@/lib/notifications/reminders';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
  const { profile, level, badges } = useGamification();
  const earnedIds = new Set(badges.map((b) => b.id));

  async function enableReminders() {
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      toast.success('Study reminders enabled');
      void showReminder('StudySphere', 'Reminders are on. Time to study!');
    } else {
      toast.error('Notifications permission denied');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
          <p className="text-sm text-muted-foreground">Earn XP, level up and unlock badges as you study.</p>
        </div>
        {notificationsSupported() && (
          <Button variant="outline" onClick={enableReminders}>
            <Bell className="h-4 w-4" /> Enable study reminders
          </Button>
        )}
      </div>

      <GlassCard className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-3xl font-bold">{level.level}</p>
          </div>
          <p className="text-sm text-muted-foreground">{profile.totalXp} XP total</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.round(level.progress * 100)}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{level.xpIntoLevel} / {level.xpForNext} XP to level {level.level + 1}</p>
      </GlassCard>

      <div>
        <h2 className="mb-3 font-semibold">Badges</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((b) => {
            const earned = earnedIds.has(b.id);
            return (
              <GlassCard key={b.id} className={cn('text-center', !earned && 'opacity-50 grayscale')}>
                <div className="text-3xl">{b.emoji}</div>
                <p className="mt-1 font-semibold">{b.label}</p>
                <p className="text-xs text-muted-foreground">{b.description}</p>
                <p className={cn('mt-1 text-xs font-medium', earned ? 'text-primary' : 'text-muted-foreground')}>
                  {earned ? 'Unlocked' : 'Locked'}
                </p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
