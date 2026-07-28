import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { PLANNER_COLLECTIONS, type MonthlyGoal, type MonthlyPlan } from '@/lib/firestore/planner-schema';
import { monthKey } from '@/lib/planner/date-keys';

function monthlyDoc(uid: string, key: string) {
  return doc(db, COLLECTIONS.users, uid, PLANNER_COLLECTIONS.monthlyPlan, key);
}

function monthlyCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, PLANNER_COLLECTIONS.monthlyPlan);
}

function newGoalId() {
  return `goal_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** A MonthlyGoal enriched with its parent month key — used by ExamCountdown and RecentActivity. */
export type UpcomingGoal = MonthlyGoal & { monthKey: string };

/** Live-subscribe to a month's plan; emits an empty goal list when none exists. */
export function subscribeMonthlyPlan(
  uid: string,
  cb: (goals: MonthlyGoal[]) => void,
  key: string = monthKey()
) {
  return onSnapshot(monthlyDoc(uid, key), (snap) => {
    const data = snap.exists() ? (snap.data() as MonthlyPlan) : null;
    cb(data?.goals ?? []);
  });
}

/**
 * Live-subscribe to upcoming goals across all months (next 6 months).
 * Used to power ExamCountdown and RecentActivity without loading every month.
 */
export function subscribeUpcomingGoals(uid: string, cb: (goals: UpcomingGoal[]) => void) {
  const q = query(monthlyCol(uid), orderBy('__name__', 'asc'));
  return onSnapshot(q, (snap) => {
    const all: UpcomingGoal[] = [];
    for (const d of snap.docs) {
      const plan = d.data() as MonthlyPlan;
      for (const g of plan.goals ?? []) {
        all.push({ ...g, monthKey: d.id });
      }
    }
    // Sort by targetDate ascending
    all.sort((a, b) => a.targetDate.localeCompare(b.targetDate));
    cb(all);
  });
}

/** Overwrite the full goal list for a month. */
async function writeGoals(uid: string, goals: MonthlyGoal[], key: string) {
  await setDoc(
    monthlyDoc(uid, key),
    { id: key, goals, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/** Add a goal (e.g. an exam date) to a month's plan. */
export async function addMonthlyGoal(
  uid: string,
  current: MonthlyGoal[],
  goal: Omit<MonthlyGoal, 'id' | 'done'>,
  key: string = monthKey()
) {
  const next = [...current, { ...goal, id: newGoalId(), done: false }];
  await writeGoals(uid, next, key);
}

/** Toggle a goal's done flag. */
export async function toggleMonthlyGoal(
  uid: string,
  current: MonthlyGoal[],
  goalId: string,
  done: boolean,
  key: string = monthKey()
) {
  const next = current.map((g) => (g.id === goalId ? { ...g, done } : g));
  await writeGoals(uid, next, key);
}

/** Remove a goal from a month's plan. */
export async function removeMonthlyGoal(
  uid: string,
  current: MonthlyGoal[],
  goalId: string,
  key: string = monthKey()
) {
  const next = current.filter((g) => g.id !== goalId);
  await writeGoals(uid, next, key);
}
/** Update a goal's fields (label, subject, targetDate) in a month's plan. */
export async function updateMonthlyGoal(
  uid: string,
  current: MonthlyGoal[],
  goalId: string,
  patch: Partial<Pick<MonthlyGoal, 'label' | 'subject' | 'targetDate'>>,
  key: string = monthKey()
) {
  const next = current.map((g) => (g.id === goalId ? { ...g, ...patch } : g));
  await writeGoals(uid, next, key);
}