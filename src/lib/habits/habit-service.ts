import {
  collection, deleteDoc, doc, onSnapshot,
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

function sortByOrder<T extends { order?: number }>(items: T[]) {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ---------------------------------------------------------------------------
// Habit CRUD
// ---------------------------------------------------------------------------

/** Live-subscribe to a user's habits. Sorting is client-side so old habits
 * without an order field cannot leave the UI stuck in a loading state. */
export function subscribeHabits(uid: string, cb: (habits: Habit[]) => void) {
  return onSnapshot(
    query(habitsCol(uid)),
    (snap) => cb(sortByOrder(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Habit))),
    (error) => {
      console.error('Habit subscription failed:', error);
      cb([]);
    }
  );
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
  return id;
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
  return onSnapshot(
    habitLogsCol(uid, habitId),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HabitLog)),
    (error) => {
      console.error(`Habit log subscription failed for ${habitId}:`, error);
      cb([]);
    }
  );
}

/** Toggle a habit's completion for a given ISO date. */
export async function toggleHabitLog(uid: string, habitId: string, date: string, completed: boolean) {
  await setDoc(
    doc(habitLogsCol(uid, habitId), date),
    { date, completed, completedAt: completed ? serverTimestamp() : null },
    { merge: true }
  );
  if (completed) await awardXp(uid, 'completeHabit');
}
