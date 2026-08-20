import type { Timestamp } from 'firebase/firestore';
import type { Subject } from '@/lib/firestore/planner-schema';

/**
 * Firestore data model for Pomodoro + Focus Shield (Milestone 3).
 * Collections (under users/{uid}):
 *   pomodoroSessions/{sessionId} - one completed focus/break session
 *   focusSettings/config         - single document of Focus Shield preferences
 */

export const POMODORO_COLLECTIONS = {
  pomodoroSessions: 'pomodoroSessions',
  focusSettings: 'focusSettings'
} as const;

export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Number of focus sessions before a long break. */
  cyclesBeforeLongBreak: number;
  autoStartNext: boolean;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartNext: false
};

export interface PomodoroSession {
  id: string;
  phase: PomodoroPhase;
  /** Planned duration in seconds. */
  durationSeconds: number;
  /** Actual focused seconds (<= duration if ended early). */
  completedSeconds: number;
  subject: Subject | null;
  completed: boolean;
  startedAt: Timestamp | null;
  endedAt: Timestamp | null;
}

/** Focus Shield preferences, persisted to focusSettings/config. */
export interface FocusSettings {
  blockShorts: boolean;
  blockReels: boolean;
  blockFacebookReels: boolean;
  customBlockList: string[];
  disableNotifications: boolean;
  distractionFreeMode: boolean;
  focusDurationMinutes: number;
  updatedAt: Timestamp | null;
}

export const DEFAULT_FOCUS_SETTINGS: Omit<FocusSettings, 'updatedAt'> = {
  blockShorts: true,
  blockReels: true,
  blockFacebookReels: true,
  customBlockList: [],
  disableNotifications: true,
  distractionFreeMode: false,
  focusDurationMinutes: 25
};
