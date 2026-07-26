import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExamId } from "@/types/exam";

interface UserState {
  userId: string;
  displayName: string;
  targetExams: ExamId[];
  dailyStudyHours: number;
  currentStreak: number;
  totalXp: number;
  level: number;
  setDisplayName: (name: string) => void;
  setTargetExams: (exams: ExamId[]) => void;
  setDailyStudyHours: (hours: number) => void;
  updateStreak: (streak: number) => void;
  addXp: (amount: number) => void;
}

function calculateLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: "demo-user",
      displayName: "Student",
      targetExams: [],
      dailyStudyHours: 4,
      currentStreak: 0,
      totalXp: 0,
      level: 1,
      setDisplayName: (name: string) => set({ displayName: name }),
      setTargetExams: (exams: ExamId[]) => set({ targetExams: exams }),
      setDailyStudyHours: (hours: number) => set({ dailyStudyHours: hours }),
      updateStreak: (streak: number) => set({ currentStreak: streak }),
      addXp: (amount: number) =>
        set((state) => {
          const newXp = state.totalXp + amount;
          return { totalXp: newXp, level: calculateLevel(newXp) };
        }),
    }),
    { name: "studysphere-user" }
  )
);
