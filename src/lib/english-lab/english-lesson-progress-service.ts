import { collection, doc, onSnapshot, setDoc, deleteDoc, orderBy, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { awardXp } from '@/lib/gamification/xp-service';

export const ENGLISH_LESSON_PROGRESS_COLLECTION = 'englishLessonProgress';

export interface EnglishLessonProgress {
  lessonId: string;
  completedAt: number;
}

function progressCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, ENGLISH_LESSON_PROGRESS_COLLECTION);
}

export function subscribeEnglishLessonProgress(uid: string, cb: (items: EnglishLessonProgress[]) => void) {
  return onSnapshot(
    query(progressCol(uid), orderBy('completedAt', 'desc')),
    (snap) => cb(snap.docs.map((item) => item.data() as EnglishLessonProgress)),
    (error) => {
      console.error('English lesson progress subscription failed:', error);
      cb([]);
    }
  );
}

export async function getEnglishLessonProgress(uid: string): Promise<EnglishLessonProgress[]> {
  const snap = await getDocs(progressCol(uid));
  return snap.docs.map((item) => item.data() as EnglishLessonProgress);
}

export async function markLessonComplete(uid: string, lessonId: string, completed: boolean) {
  const ref = doc(progressCol(uid), lessonId);
  if (!completed) {
    await deleteDoc(ref);
    return;
  }

  const existing = await getDocs(query(progressCol(uid), orderBy('completedAt', 'desc')));
  const alreadyCompleted = existing.docs.some((item) => item.id === lessonId);
  await setDoc(ref, { lessonId, completedAt: Date.now() });
  if (!alreadyCompleted) {
    await awardXp(uid, 'englishPractice');
  }
}
