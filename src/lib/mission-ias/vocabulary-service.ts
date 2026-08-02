import {
  collection, doc, onSnapshot, orderBy, query, limit as fbLimit, setDoc, deleteDoc, getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { VOCABULARY_COLLECTION, type VocabWord } from '@/lib/mission-ias/vocabulary-schema';

export function subscribeVocabulary(cb: (words: VocabWord[]) => void, max = 300) {
  const q = query(collection(db, VOCABULARY_COLLECTION), orderBy('createdAt', 'desc'), fbLimit(max));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as VocabWord)));
}

function progressCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, 'vocabProgress');
}

export async function getLearnedWordIds(uid: string): Promise<Set<string>> {
  const snap = await getDocs(progressCol(uid));
  return new Set(snap.docs.map((d) => d.id));
}

export async function markWordLearned(uid: string, wordId: string, learned: boolean) {
  const ref = doc(progressCol(uid), wordId);
  if (learned) await setDoc(ref, { wordId, learnedAt: Date.now() });
  else await deleteDoc(ref);
}
