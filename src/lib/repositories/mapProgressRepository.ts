import { collection, doc, getDocs, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firestore/schema";
import { getCurrentUserId } from "@/utils/getCurrentUserId";

export interface StateProgress {
  stateName: string;
  correctCount: number;
  incorrectCount: number;
}

const SUBCOLLECTION = "mapProgress";

/** A state counts as "mastered" once it's been answered correctly at least
 * 3 times with at least 70% accuracy overall — enough repetition to be a
 * real signal, not a lucky first guess. */
const MASTERY_MIN_CORRECT = 3;
const MASTERY_MIN_ACCURACY = 0.7;

function docKey(stateName: string): string {
  return stateName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function progressCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, SUBCOLLECTION);
}

/** Record one quiz attempt (Identify Quiz or Timed Challenge) for a state. */
export async function recordMapAttempt(stateName: string, correct: boolean): Promise<void> {
  const uid = getCurrentUserId();
  const ref = doc(progressCol(uid), docKey(stateName));
  await setDoc(
    ref,
    {
      stateName,
      correctCount: increment(correct ? 1 : 0),
      incorrectCount: increment(correct ? 0 : 1),
      lastPracticedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** All per-state progress for the signed-in user. */
export async function getMapProgress(): Promise<StateProgress[]> {
  const uid = getCurrentUserId();
  const snap = await getDocs(progressCol(uid));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      stateName: data.stateName as string,
      correctCount: (data.correctCount as number) ?? 0,
      incorrectCount: (data.incorrectCount as number) ?? 0,
    };
  });
}

export function isMastered(p: StateProgress): boolean {
  const total = p.correctCount + p.incorrectCount;
  if (p.correctCount < MASTERY_MIN_CORRECT || total === 0) return false;
  return p.correctCount / total >= MASTERY_MIN_ACCURACY;
}

/** Aggregate quick stats: overall accuracy % and count of mastered states. */
export function summarizeMapProgress(rows: StateProgress[]): { accuracyPct: number; statesMastered: number } {
  const totalCorrect = rows.reduce((s, r) => s + r.correctCount, 0);
  const totalAttempts = rows.reduce((s, r) => s + r.correctCount + r.incorrectCount, 0);
  const accuracyPct = totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);
  const statesMastered = rows.filter(isMastered).length;
  return { accuracyPct, statesMastered };
}
