import { addDoc, collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { awardXp } from '@/lib/gamification/xp-service';
import { CASE_STUDY_SESSIONS_COLLECTION, type CaseStudySession, type CaseStudyFeedback } from './ethics-schema';

function caseStudyCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, CASE_STUDY_SESSIONS_COLLECTION);
}

export function subscribeCaseStudySessions(uid: string, cb: (sessions: CaseStudySession[]) => void) {
  const q = query(caseStudyCol(uid), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CaseStudySession)),
    (error) => {
      console.error('subscribeCaseStudySessions error:', error);
      cb([]);
    }
  );
}

/** Saves a completed case study attempt and awards XP (feeds the app-wide Total XP). */
export async function saveCaseStudySession(
  uid: string,
  scenario: string,
  questions: string[],
  answer: string,
  feedback: CaseStudyFeedback
) {
  await addDoc(caseStudyCol(uid), { scenario, questions, answer, feedback, createdAt: Date.now() });
  await awardXp(uid, 'ethicsCaseStudy');
}
