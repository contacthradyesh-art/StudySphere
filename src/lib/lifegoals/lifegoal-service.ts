import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc, where
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import {
  LIFEGOAL_COLLECTIONS,
  type LifeGoal,
  type LifeMilestone,
  type NewLifeGoal,
  type NewLifeMilestone
} from '@/lib/firestore/lifegoal-schema';
import { awardXp } from '@/lib/gamification/xp-service';
import { ensureStudyNotifications, schedulePersistentReminder } from '@/lib/notifications/native-reminders';

function lifeGoalsCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, LIFEGOAL_COLLECTIONS.lifeGoals);
}

function lifeMilestonesCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, LIFEGOAL_COLLECTIONS.lifeMilestones);
}

function scheduleGoalReminder(goalId: string, data: NewLifeGoal) {
  if (!data.reminderAt || data.reminderAt <= Date.now()) return;
  void ensureStudyNotifications().then((granted) => {
    if (!granted) return;
    schedulePersistentReminder(
      data.reminderAt!,
      `Goal reminder: ${data.title}`,
      data.examTag ? `${data.examTag} target is waiting. Open StudySphere to continue.` : 'Your goal is waiting. Open StudySphere to continue.',
      Math.abs(hashCode(goalId))
    );
  });
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash) + value.charCodeAt(i);
  return hash | 0;
}

// ---------------------------------------------------------------------------
// LifeGoal CRUD
// ---------------------------------------------------------------------------

export function subscribeLifeGoals(uid: string, cb: (goals: LifeGoal[]) => void) {
  const q = query(lifeGoalsCol(uid), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LifeGoal));
  });
}

export async function createLifeGoal(uid: string, data: NewLifeGoal, order = 0) {
  const ref = await addDoc(lifeGoalsCol(uid), {
    ...data,
    status: 'active',
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null
  });
  scheduleGoalReminder(ref.id, data);
}

export async function updateLifeGoal(uid: string, goalId: string, patch: Partial<LifeGoal>) {
  await updateDoc(doc(lifeGoalsCol(uid), goalId), { ...patch, updatedAt: serverTimestamp() });
  if (patch.reminderAt && patch.reminderAt > Date.now()) {
    const goal = patch as Partial<LifeGoal>;
    void ensureStudyNotifications().then((granted) => {
      if (granted) schedulePersistentReminder(patch.reminderAt!, `Goal reminder: ${goal.title ?? 'Study goal'}`, 'Your goal reminder is due. Open StudySphere to continue.', Math.abs(hashCode(goalId)));
    });
  }
}

export async function completeLifeGoal(uid: string, goalId: string) {
  await updateLifeGoal(uid, goalId, { status: 'completed', completedAt: serverTimestamp() as any });
  await awardXp(uid, 'completeGoal');
}

export async function deleteLifeGoal(uid: string, goalId: string) {
  await deleteDoc(doc(lifeGoalsCol(uid), goalId));
}

// ---------------------------------------------------------------------------
// LifeMilestone CRUD
// ---------------------------------------------------------------------------

export function subscribeLifeMilestones(uid: string, cb: (milestones: LifeMilestone[]) => void) {
  const q = query(lifeMilestonesCol(uid), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LifeMilestone));
  });
}

export function subscribeLifeMilestonesForGoal(uid: string, lifeGoalId: string, cb: (milestones: LifeMilestone[]) => void) {
  const q = query(lifeMilestonesCol(uid), where('lifeGoalId', '==', lifeGoalId), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LifeMilestone));
  });
}

export async function createLifeMilestone(uid: string, data: NewLifeMilestone, order = 0) {
  await addDoc(lifeMilestonesCol(uid), {
    ...data,
    status: 'pending',
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null
  });
}

export async function updateLifeMilestone(uid: string, milestoneId: string, patch: Partial<LifeMilestone>) {
  await updateDoc(doc(lifeMilestonesCol(uid), milestoneId), { ...patch, updatedAt: serverTimestamp() });
}

export async function completeLifeMilestone(uid: string, milestoneId: string) {
  await updateLifeMilestone(uid, milestoneId, { status: 'completed', completedAt: serverTimestamp() as any });
  await awardXp(uid, 'completeMilestone');
}

export async function deleteLifeMilestone(uid: string, milestoneId: string) {
  await deleteDoc(doc(lifeMilestonesCol(uid), milestoneId));
}
