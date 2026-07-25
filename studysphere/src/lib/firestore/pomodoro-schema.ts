export interface PomodoroSession {
  id: string;
  phase: 'focus' | 'break';
  completed: boolean;
  completedSeconds: number;
  durationSeconds: number;
  subject?: string;
  endedAt?: unknown;
}
