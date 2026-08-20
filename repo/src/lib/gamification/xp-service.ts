import { doc, increment, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { XP_REWARDS, type XpAction } from '@/lib/gamification/xp';

/**
 * Gamification profile, persisted at users/{uid}/gamification/profile.
 * Counters are incremented atomically so awards from different features never
 * clobber each other.
 */
export interface GamificationProfile {
  totalXp: number;
  tasksCompleted: number;
  pomodorosCompleted: number;
  journalEntries: number;
  flashcardsReviewed: number;
  notesCreated: number;
  earnedBadgeIds: string[];
}

export const DEFAULT_PROFILE: GamificationProfile = {
  totalXp: 0,
  tasksCompleted: 0,
  pomodorosCompleted: 0,
  journalEntries: 0,
  flashcardsReviewed: 0,
  notesCreated: 0,
  earnedBadgeIds: []
};

const GAMIFICATION = 'gamification';

function profileDoc(uid: string) {
  return doc(db, COLLECTIONS.users, uid, GAMIFICATION, 'profile');
}

/** Map an XP action to the counter it should increment. */
const ACTION_COUNTER: Partial<Record<XpAction, keyof GamificationProfile>> = {
  completeTask: 'tasksCompleted',
  completePomodoro: 'pomodorosCompleted',
  journalEntry: 'journalEntries',
  reviewFlashcard: 'flashcardsReviewed',
  createNote: 'notesCreated'
};

/** Live-subscribe to the gamification profile. */
export function subscribeProfile(uid: string, cb: (p: GamificationProfile) => void) {
  return onSnapshot(profileDoc(uid), (snap) => {
    cb(snap.exists() ? { ...DEFAULT_PROFILE, ...(snap.data() as GamificationProfile) } : DEFAULT_PROFILE);
  });
}

/**
 * Award XP for an action and increment its counter. Call this from feature
 * code, e.g. awardXp(uid, 'completePomodoro') when a focus session finishes.
 */
export async function awardXp(uid: string, action: XpAction, times = 1) {
  const amount = XP_REWARDS[action] * times;
  const counter = ACTION_COUNTER[action];
  const patch: Record<string, unknown> = {
    totalXp: increment(amount),
    updatedAt: serverTimestamp()
  };
  if (counter) patch[counter] = increment(times);
  await setDoc(profileDoc(uid), patch, { merge: true });
}

/** Persist the set of earned badge ids (called after recomputing locally). */
export async function syncEarnedBadges(uid: string, earnedBadgeIds: string[]) {
  await setDoc(profileDoc(uid), { earnedBadgeIds, updatedAt: serverTimestamp() }, { merge: true });
}
