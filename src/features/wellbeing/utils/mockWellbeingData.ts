import type { WellbeingData, MoodEntry, Mood } from "../types";

export function getMockWellbeingData(): WellbeingData {
  const moods: Mood[] = ["great", "good", "okay", "good", "low", "good", "great"];
  const moodHistory: MoodEntry[] = moods.map((mood, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { id: `mood-${i}`, mood, date: d.toISOString().split("T")[0], time: "09:00", note: i === 4 ? "Felt overwhelmed with syllabus" : undefined };
  });
  return {
    todayMood: moodHistory[moodHistory.length - 1], moodHistory,
    focusSession: { id: "focus-1", durationMinutes: 25, completedMinutes: 0, status: "idle" },
    breakReminder: { enabled: true, intervalMinutes: 45, lastBreak: new Date(Date.now() - 30 * 60000).toISOString() },
    stats: { totalFocusMinutesToday: 75, totalFocusMinutesWeek: 420, moodAverage: 3.7, streakDaysWithMoodLog: 7 },
  };
}
