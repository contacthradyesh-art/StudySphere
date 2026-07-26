'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PomodoroPhase, PomodoroSettings } from '@/lib/firestore/pomodoro-schema';

function phaseSeconds(phase: PomodoroPhase, s: PomodoroSettings): number {
  if (phase === 'focus') return s.focusMinutes * 60;
  if (phase === 'shortBreak') return s.shortBreakMinutes * 60;
  return s.longBreakMinutes * 60;
}

interface UsePomodoroArgs {
  settings: PomodoroSettings;
  onComplete: (phase: PomodoroPhase, durationSeconds: number) => void;
}

/**
 * Drift-free Pomodoro timer.
 *
 * Instead of decrementing a counter on each tick (which drifts when the tab is
 * throttled), we store the target end timestamp and derive remaining time from
 * Date.now(). The 250ms interval is only for UI refresh.
 */
export function usePomodoro({ settings, onComplete }: UsePomodoroArgs) {
  const [phase, setPhase] = useState<PomodoroPhase>('focus');
  const [completedFocusCount, setCompletedFocusCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(phaseSeconds('focus', settings));
  const endRef = useRef<number | null>(null);

  const total = phaseSeconds(phase, settings);

  const nextPhase = useCallback((): PomodoroPhase => {
    if (phase !== 'focus') return 'focus';
    const focusDone = completedFocusCount + 1;
    return focusDone % settings.cyclesBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
  }, [phase, completedFocusCount, settings.cyclesBeforeLongBreak]);

  const start = useCallback(() => {
    endRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  }, [remaining]);

  const pause = useCallback(() => {
    setRunning(false);
    endRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    endRef.current = null;
    setRemaining(phaseSeconds(phase, settings));
  }, [phase, settings]);

  const switchTo = useCallback((p: PomodoroPhase) => {
    setRunning(false);
    endRef.current = null;
    setPhase(p);
    setRemaining(phaseSeconds(p, settings));
  }, [settings]);

  // Tick loop derives remaining from the absolute end timestamp.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (endRef.current == null) return;
      const secsLeft = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setRemaining(secsLeft);
      if (secsLeft <= 0) {
        clearInterval(id);
        setRunning(false);
        endRef.current = null;
        const finishedPhase = phase;
        const dur = phaseSeconds(finishedPhase, settings);
        if (finishedPhase === 'focus') setCompletedFocusCount((c) => c + 1);
        onComplete(finishedPhase, dur);
        const np = nextPhase();
        setPhase(np);
        setRemaining(phaseSeconds(np, settings));
        if (settings.autoStartNext) {
          endRef.current = Date.now() + phaseSeconds(np, settings) * 1000;
          setRunning(true);
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, phase, settings, onComplete, nextPhase]);

  const progress = total > 0 ? 1 - remaining / total : 0;

  return { phase, remaining, total, progress, running, completedFocusCount, start, pause, reset, switchTo };
}
