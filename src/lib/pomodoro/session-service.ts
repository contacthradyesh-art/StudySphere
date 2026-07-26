import {
  addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import {
  POMODORO_COLLECTIONS, DEFAULT_FOCUS_SETTINGS,
  type FocusSettings, type PomodoroSession
} from '@/lib/firestore/pomodoro-schema';

function sessionsCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, POMODORO_COLLECTIONS.pomodoroSessions);
}
function focusDoc(uid: string) {
  return doc(db, COLLECTIONS.users, uid, POMODORO_COLLECTIONS.focusSettings, 'config');
}

/** Persist a completed (or early-ended) session. */
export async function recordSession(
  uid: string,
  data: Pick<PomodoroSession, 'phase' | 'durationSeconds' | 'completedSeconds' | 'subject' | 'completed'>
) {
  await addDoc(sessionsCol(uid), {
    ...data,
    startedAt: serverTimestamp(),
    endedAt: serverTimestamp()
  });
}

/** Live-subscribe to session history (most recent first). */
export function subscribeSessions(uid: string, cb: (sessions: PomodoroSession[]) => void) {
  const q = query(sessionsCol(uid), orderBy('endedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PomodoroSession));
  });
}

/** Read Focus Shield settings, falling back to defaults. */
export async function getFocusSettings(uid: string): Promise<Omit<FocusSettings, 'updatedAt'>> {
  const snap = await getDoc(focusDoc(uid));
  if (!snap.exists()) return DEFAULT_FOCUS_SETTINGS;
  const data = snap.data() as FocusSettings;
  return { ...DEFAULT_FOCUS_SETTINGS, ...data };
}

/** Upsert Focus Shield settings. */
export async function saveFocusSettings(uid: string, settings: Omit<FocusSettings, 'updatedAt'>) {
  await setDoc(focusDoc(uid), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
}
