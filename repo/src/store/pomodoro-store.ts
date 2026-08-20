import { create } from 'zustand';
import { DEFAULT_POMODORO_SETTINGS, type PomodoroSession, type PomodoroSettings } from '@/lib/firestore/pomodoro-schema';

interface PomodoroStoreState {
  settings: PomodoroSettings;
  sessions: PomodoroSession[];
  fullScreen: boolean;
  setSettings: (patch: Partial<PomodoroSettings>) => void;
  setSessions: (sessions: PomodoroSession[]) => void;
  setFullScreen: (on: boolean) => void;
}

/** Holds Pomodoro settings, live session history and focus-mode flag. */
export const usePomodoroStore = create<PomodoroStoreState>((set) => ({
  settings: DEFAULT_POMODORO_SETTINGS,
  sessions: [],
  fullScreen: false,
  setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  setSessions: (sessions) => set({ sessions }),
  setFullScreen: (fullScreen) => set({ fullScreen })
}));
