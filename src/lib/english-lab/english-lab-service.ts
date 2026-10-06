import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { awardXp } from '@/lib/gamification/xp-service';
import { SPEAKING_SESSIONS_COLLECTION, type SpeakingSession, type SpeakingFeedback } from './english-lab-schema';

function speakingCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, SPEAKING_SESSIONS_COLLECTION);
}

export function subscribeSpeakingSessions(uid: string, cb: (sessions: SpeakingSession[]) => void) {
  const q = query(speakingCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SpeakingSession)));
}

export async function saveSpeakingSession(uid: string, prompt: string, feedback: SpeakingFeedback) {
  await addDoc(speakingCol(uid), { prompt, feedback, createdAt: Date.now() });
  await awardXp(uid, 'englishPractice');
}