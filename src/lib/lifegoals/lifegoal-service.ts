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

function lifeGoalsCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, LIFEGOAL_COLLECTIONS.lifeGoals);
}

function lifeMilestonesCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, LIFEGOAL_COLLECTIONS.lifeMilestones);
}

// ---------------------------------------------------------------------------
// LifeGoal CRUD
// ---------------------------------------------------------------------------

/** Live-subscribe to a user's life goals, ordered by manual sort order. */
export function subscribeLifeGoals(uid: string, cb: (goals: LifeGoal[]) => void) {
  const q = query(lifeGoalsCol(uid), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LifeGoal));
  });
}

export async function createLifeGoal(uid: string, data: NewLifeGoal, order = 0) {
  await addDoc(lifeGoalsCol(uid), {
    ...data,
    status: 'active',
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null
  });
}

export async function updateLifeGoal(uid: string, goalId: string, patch: Partial<LifeGoal>) {
  await updateDoc(doc(lifeGoalsCol(uid), goalId), { ...patch, updatedAt: serverTimestamp() });
}

/**
 * Mark a goal completed and award XP exactly once. Caller is responsible for
 * only calling this on a goal that wasn't already completed (the goal-detail
 * UI will guard this via the goal's current status).
 */
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

/** Live-subscribe to all of a user's milestones (across all goals). */
export function subscribeLifeMilestones(uid: string, cb: (milestones: LifeMilestone[]) => void) {
  const q = query(lifeMilestonesCol(uid), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LifeMilestone));
  });
}

/** Live-subscribe to milestones for a single goal only. */
export function subscribeLifeMilestonesForGoal(
  uid: string,
  lifeGoalId: string,
  cb: (milestones: LifeMilestone[]) => void
) {
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

/**
 * Mark a milestone completed and award XP exactly once. Caller (UI) should
 * only invoke this on a transition into 'completed' to avoid duplicate awards.
 */
export async function completeLifeMilestone(uid: string, milestoneId: string) {
  await updateLifeMilestone(uid, milestoneId, { status: 'completed', completedAt: serverTimestamp() as any });
  await awardXp(uid, 'completeMilestone');
}

export async function deleteLifeMilestone(uid: string, milestoneId: string) {
  await deleteDoc(doc(lifeMilestonesCol(uid), milestoneId));
}
