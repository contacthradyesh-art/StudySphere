import { addDoc, collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { awardXp } from '@/lib/gamification/xp-service';
import {
  WRITING_SESSIONS_COLLECTION, SPEAKING_SESSIONS_COLLECTION,
  type WritingSession, type WritingFeedback, type SpeakingSession, type SpeakingFeedback
} from './english-lab-schema';

function writingCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, WRITING_SESSIONS_COLLECTION);
}
function speakingCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, SPEAKING_SESSIONS_COLLECTION);
}

export function subscribeWritingSessions(uid: string, cb: (sessions: WritingSession[]) => void) {
  const q = query(writingCol(uid), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WritingSession));
  });
}

export function subscribeSpeakingSessions(uid: string, cb: (sessions: SpeakingSession[]) => void) {
  const q = query(speakingCol(uid), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SpeakingSession));
  });
}

/** Saves a completed writing session and awards XP (feeds the app-wide Total XP). */
export async function saveWritingSession(uid: string, prompt: string, text: string, feedback: WritingFeedback) {
  await addDoc(writingCol(uid), { prompt, text, feedback, createdAt: Date.now() });
  await awardXp(uid, 'englishPractice');
}

/** Saves a completed speaking session and awards XP (feeds the app-wide Total XP). */
export async function saveSpeakingSession(uid: string, prompt: string, feedback: SpeakingFeedback) {
  await addDoc(speakingCol(uid), { prompt, feedback, createdAt: Date.now() });
  await awardXp(uid, 'englishPractice');
}
