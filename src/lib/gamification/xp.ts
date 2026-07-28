/**
 * XP, levelling and badge rules for StudySphere gamification (Milestone 8).
 * Pure functions only — no Firestore access here so they are easy to test.
 */

export const XP_REWARDS = {
  completeTask: 10,
  completePomodoro: 15,
  journalEntry: 8,
  reviewFlashcard: 2,
  createNote: 5,
  // Foundation Phase additions (Goal/Milestone/Habit system) — additive only,
  // existing actions and values above are untouched.
  completeHabit: 5,
  completeMilestone: 30,
  completeGoal: 100,
  completeMockTest: 25
} as const;

export type XpAction = keyof typeof XP_REWARDS;

/**
 * Cumulative XP required to *reach* a level. Level 1 starts at 0 XP; each
 * subsequent level costs 100 * level more than the last (triangular curve).
 */
export function xpForLevel(level: number): number {
  // level 1 -> 0, level 2 -> 100, level 3 -> 300, level 4 -> 600 ...
  const n = Math.max(1, level) - 1;
  return (100 * n * (n + 1)) / 2;
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
  progress: number; // 0-1 toward next level
}

/** Derive the current level and progress toward the next from total XP. */
export function levelFromXp(totalXp: number): LevelProgress {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level += 1;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const xpIntoLevel = totalXp - base;
  const xpForNext = next - base;
  return { level, xpIntoLevel, xpForNext, progress: xpForNext === 0 ? 1 : xpIntoLevel / xpForNext };
}

export interface BadgeDef {
  id: string;
  label: string;
  description: string;
  emoji: string;
  /** Returns true when the badge is earned given the user's stats. */
  earned: (s: BadgeStats) => boolean;
}

export interface BadgeStats {
  totalXp: number;
  level: number;
  tasksCompleted: number;
  pomodorosCompleted: number;
  streakDays: number;
  journalEntries: number;
  // Foundation Phase additions — optional so existing callers (which don't
  // pass these) keep working unchanged.
  goalsCompleted?: number;
  milestonesCompleted?: number;
  longestHabitStreak?: number;
}

export const BADGES: BadgeDef[] = [
  { id: 'first-steps', label: 'First Steps', description: 'Earn your first XP', emoji: '🌱', earned: (s) => s.totalXp > 0 },
  { id: 'focused', label: 'Focused', description: 'Complete 10 pomodoros', emoji: '🎯', earned: (s) => s.pomodorosCompleted >= 10 },
  { id: 'task-master', label: 'Task Master', description: 'Complete 50 tasks', emoji: '✅', earned: (s) => s.tasksCompleted >= 50 },
  { id: 'on-fire', label: 'On Fire', description: '7-day streak', emoji: '🔥', earned: (s) => s.streakDays >= 7 },
  { id: 'reflective', label: 'Reflective', description: 'Write 10 journal entries', emoji: '📓', earned: (s) => s.journalEntries >= 10 },
  { id: 'scholar', label: 'Scholar', description: 'Reach level 5', emoji: '🎓', earned: (s) => s.level >= 5 },
  { id: 'legend', label: 'Legend', description: 'Reach level 10', emoji: '🏆', earned: (s) => s.level >= 10 },
  // Foundation Phase additions (Goal/Milestone/Habit system) — additive only.
  { id: 'goal-getter', label: 'Goal Getter', description: 'Complete your first life goal', emoji: '🏁', earned: (s) => (s.goalsCompleted ?? 0) >= 1 },
  { id: 'milestone-maker', label: 'Milestone Maker', description: 'Complete 10 milestones', emoji: '🚩', earned: (s) => (s.milestonesCompleted ?? 0) >= 10 },
  { id: 'habit-hero', label: 'Habit Hero', description: '30-day habit streak', emoji: '🧘', earned: (s) => (s.longestHabitStreak ?? 0) >= 30 }
];

/** Return the list of earned badge definitions for the given stats. */
export function earnedBadges(stats: BadgeStats): BadgeDef[] {
  return BADGES.filter((b) => b.earned(stats));
}
