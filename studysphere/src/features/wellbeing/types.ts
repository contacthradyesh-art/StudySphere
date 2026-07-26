export type Mood = "great" | "good" | "okay" | "low" | "stressed";
export interface MoodEntry { id: string; mood: Mood; note?: string; date: string; time: string; }
export interface FocusSession { id: string; durationMinutes: number; completedMinutes: number; status: "idle" | "active" | "paused" | "completed"; startedAt?: Date; }
export interface WellbeingData {
  todayMood?: MoodEntry; moodHistory: MoodEntry[]; focusSession: FocusSession;
  breakReminder: { enabled: boolean; intervalMinutes: number; lastBreak?: string; };
  stats: { totalFocusMinutesToday: number; totalFocusMinutesWeek: number; moodAverage: number; streakDaysWithMoodLog: number; };
}
