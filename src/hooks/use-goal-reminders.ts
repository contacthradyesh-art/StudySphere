'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { subscribeLifeGoals } from '@/lib/lifegoals/lifegoal-service';
import type { LifeGoal } from '@/lib/firestore/lifegoal-schema';

const FIRED_KEY = 'ss_goal_reminders_fired';
const CHECK_INTERVAL_MS = 15000;

/** A short, pleasant ascending chime built with the Web Audio API — no mp3 file needed. */
function playAlarmTune() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [880, 988, 1046.5, 1318.5]; // A5, B5, C6, E6 — bright, non-jarring chime
    let t = ctx.currentTime;

    for (let round = 0; round < 2; round++) {
      for (const freq of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.28, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
        t += 0.22;
      }
      t += 0.15;
    }
  } catch {
    /* Autoplay/audio restrictions — fail silently, toast + notification still show. */
  }
}

function getFiredSet(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function markFired(id: string) {
  const set = getFiredSet();
  set.add(id);
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

/**
 * Watches all of the user's active life-goal reminders and, once StudySphere
 * is open, fires a chime + toast + browser notification exactly once per
 * reminder when its time arrives. Mount once near the app root
 * (see GoalReminderWatcher) so it works from any page.
 */
export function useGoalReminders() {
  const { user } = useAuth();
  const goalsRef = useRef<LifeGoal[]>([]);

  useEffect(() => {
    if (!user) return;
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    const unsub = subscribeLifeGoals(user.uid, (goals) => {
      goalsRef.current = goals;
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const fired = getFiredSet();

      for (const goal of goalsRef.current) {
        if (!goal.reminderAt || goal.status !== 'active') continue;
        if (goal.reminderAt > now) continue;
        if (fired.has(goal.id)) continue;

        markFired(goal.id);
        playAlarmTune();
        toast.message(`🔔 Goal reminder: ${goal.title}`, {
          description: goal.examTag || 'Time to work on this goal.',
          duration: 8000
        });
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('StudySphere — Goal reminder', { body: goal.title });
          } catch {
            /* ignore */
          }
        }
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
}