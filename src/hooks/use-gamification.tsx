'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeProfile, DEFAULT_PROFILE, type GamificationProfile } from '@/lib/gamification/xp-service';
import { earnedBadges, levelFromXp, type BadgeDef, type LevelProgress } from '@/lib/gamification/xp';

export interface Gamification {
  profile: GamificationProfile;
  level: LevelProgress;
  badges: BadgeDef[];
}

export function useGamification(streakDays = 0): Gamification {
  const { user } = useAuth();
  const [profile, setProfile] = useState<GamificationProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeProfile(user.uid, setProfile);
    return () => unsub();
  }, [user]);

  const level = useMemo(() => levelFromXp(profile.totalXp), [profile.totalXp]);
  const badges = useMemo(
    () =>
      earnedBadges({
        totalXp: profile.totalXp,
        level: level.level,
        tasksCompleted: profile.tasksCompleted,
        pomodorosCompleted: profile.pomodorosCompleted,
        streakDays,
        journalEntries: profile.journalEntries
      }),
    [profile, level.level, streakDays]
  );

  return { profile, level, badges };
}