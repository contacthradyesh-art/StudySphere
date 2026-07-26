import {
  collection, deleteDoc, doc, onSnapshot, orderBy,
  query, serverTimestamp, setDoc, updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { HABIT_COLLECTIONS, type Habit, type HabitLog, type NewHabit } from '@/lib/firestore/habit-schema';
import { awardXp } from '@/lib/gamification/xp-service';

function habitsCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, HABIT_COLLECTIONS.habits);
}

function habitLogsCol(uid: string, habitId: string) {
  return collection(db, COLLECTIONS.users, uid, HABIT_COLLECTIONS.habits, habitId, HABIT_COLLECTIONS.logs);
}

function newHabitId() {
  return `habit_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// ---------------------------------------------------------------------------
// Habit CRUD
// ---------------------------------------------------------------------------

/** Live-subscribe to a user's habits, ordered by manual sort order. */
export function subscribeHabits(uid: string, cb: (habits: Habit[]) => void) {
  const q = query(habitsCol(uid), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Habit));
  });
}

export async function createHabit(uid: string, data: NewHabit, order = 0) {
  const id = newHabitId();
  await setDoc(doc(habitsCol(uid), id), {
    ...data,
    status: 'active',
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateHabit(uid: string, habitId: string, patch: Partial<Habit>) {
  await updateDoc(doc(habitsCol(uid), habitId), { ...patch, updatedAt: serverTimestamp() });
}

export async function archiveHabit(uid: string, habitId: string) {
  await updateHabit(uid, habitId, { status: 'archived' });
}

export async function deleteHabit(uid: string, habitId: string) {
  await deleteDoc(doc(habitsCol(uid), habitId));
}

// ---------------------------------------------------------------------------
// Habit logs (per-day completion)
// ---------------------------------------------------------------------------

/** Live-subscribe to a single habit's completion logs. */
export function subscribeHabitLogs(uid: string, habitId: string, cb: (logs: HabitLog[]) => void) {
  return onSnapshot(habitLogsCol(uid, habitId), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HabitLog));
  });
}

/**
 * Toggle a habit's completion for a given ISO date (doc id = date, so this is
 * idempotent — no duplicate logs possible for the same day). Awards XP only
 * when transitioning into completed=true, never on un-checking.
 */
export async function toggleHabitLog(uid: string, habitId: string, date: string, completed: boolean) {
  await setDoc(
    doc(habitLogsCol(uid, habitId), date),
    { date, completed, completedAt: completed ? serverTimestamp() : null },
    { merge: true }
  );
  if (completed) await awardXp(uid, 'completeHabit');
}
