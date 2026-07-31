'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { subscribeLifeGoals } from '@/lib/lifegoals/lifegoal-service';
import { subscribeTasks } from '@/lib/planner/task-service';
import type { LifeGoal } from '@/lib/firestore/lifegoal-schema';
import type { Task } from '@/lib/firestore/planner-schema';

const FIRED_KEY = 'ss_goal_reminders_fired';
const CHECK_INTERVAL_MS = 15000;

// Shared, lazily-unlocked AudioContext. Browsers block sound that isn't
// triggered by a user gesture, so we create/resume this on the user's very
// first tap anywhere in the app, then reuse it later when an alarm fires
// on its own (from a background timer, with no tap involved).
let sharedCtx: AudioContext | null = null;

function getAudioCtxCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  return window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || null;
}

function unlockAudio() {
  const Ctor = getAudioCtxCtor();
  if (!Ctor) return;
  if (!sharedCtx) sharedCtx = new Ctor();
  if (sharedCtx.state === 'suspended') sharedCtx.resume().catch(() => {});
}

/** A short, pleasant ascending chime built with the Web Audio API — no mp3 file needed. */
function playAlarmTune() {
  try {
    const Ctor = getAudioCtxCtor();
    if (!Ctor) return;
    if (!sharedCtx) sharedCtx = new Ctor();
    const ctx = sharedCtx;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

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
    /* Audio failed — toast + notification below still show. */
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

function fire(key: string, title: string, subtitle: string) {
  markFired(key);
  playAlarmTune();
  toast.message(`🔔 ${title}`, { description: subtitle, duration: 8000 });
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('StudySphere — Reminder', { body: title });
    } catch {
      /* ignore */
    }
  }
}

/**
 * Watches all of the user's active life-goal reminders AND task reminders,
 * and once StudySphere is open, fires a chime + toast + browser notification
 * exactly once per reminder when its time arrives. Mount once near the app
 * root (see GoalReminderWatcher) so it works from any page.
 */
export function useGoalReminders() {
  const { user } = useAuth();
  const goalsRef = useRef<LifeGoal[]>([]);
  const tasksRef = useRef<Task[]>([]);

  // Unlock audio on the very first tap anywhere, so later background-timer
  // alarms are allowed to play sound.
  useEffect(() => {
    function onFirstInteraction() {
      unlockAudio();
      window.removeEventListener('pointerdown', onFirstInteraction);
    }
    window.addEventListener('pointerdown', onFirstInteraction, { once: true });
    return () => window.removeEventListener('pointerdown', onFirstInteraction);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    const unsubGoals = subscribeLifeGoals(user.uid, (goals) => {
      goalsRef.current = goals;
    });
    const unsubTasks = subscribeTasks(user.uid, (tasks) => {
      tasksRef.current = tasks;
    });
    return () => {
      unsubGoals();
      unsubTasks();
    };
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const fired = getFiredSet();

      for (const goal of goalsRef.current) {
        if (!goal.reminderAt || goal.status !== 'active') continue;
        if (goal.reminderAt > now) continue;
        const key = `goal:${goal.id}`;
        if (fired.has(key)) continue;
        fire(key, goal.title, goal.examTag || 'Time to work on this goal.');
      }

      for (const task of tasksRef.current) {
        if (!task.reminderAt || task.completed) continue;
        if (task.reminderAt > now) continue;
        const key = `task:${task.id}`;
        if (fired.has(key)) continue;
        fire(key, task.title, task.subject || 'Time for this task.');
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
}