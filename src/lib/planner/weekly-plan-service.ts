import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { PLANNER_COLLECTIONS, type WeeklyPlan, type WeeklySlot } from '@/lib/firestore/planner-schema';
import { weekKey } from '@/lib/planner/date-keys';

function weeklyDoc(uid: string, key: string) {
  return doc(db, COLLECTIONS.users, uid, PLANNER_COLLECTIONS.weeklyPlan, key);
}

/** Read the weekly plan for a given week (defaults to the current week). */
export async function getWeeklyPlan(uid: string, key: string = weekKey()): Promise<WeeklyPlan | null> {
  const snap = await getDoc(weeklyDoc(uid, key));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WeeklyPlan;
}

/** Live-subscribe to a week's plan; emits null when none exists yet. */
export function subscribeWeeklyPlan(
  uid: string,
  cb: (plan: WeeklyPlan | null) => void,
  key: string = weekKey()
) {
  return onSnapshot(weeklyDoc(uid, key), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as WeeklyPlan) : null);
  });
}

/** Upsert the slots for a week (defaults to the current week). */
export async function saveWeeklyPlan(uid: string, slots: WeeklySlot[], key: string = weekKey()) {
  await setDoc(
    weeklyDoc(uid, key),
    { id: key, slots, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
