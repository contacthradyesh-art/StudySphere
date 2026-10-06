import {
  collection, doc, onSnapshot, orderBy, query, limit as fbLimit, setDoc, deleteDoc, getDocs, getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { VOCABULARY_COLLECTION, type VocabWord } from '@/lib/mission-ias/vocabulary-schema';

export function subscribeVocabulary(cb: (words: VocabWord[]) => void, max = 300) {
  const q = query(collection(db, VOCABULARY_COLLECTION), orderBy('createdAt', 'desc'), fbLimit(max));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data() as VocabWord)),
    (error) => {
      console.error('subscribeVocabulary error:', error);
      cb([]); // stop the "Loading vocabulary..." spinner instead of hanging forever
    }
  );
}

function progressCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, 'vocabProgress');
}

export async function getLearnedWordIds(uid: string): Promise<Set<string>> {
  const snap = await getDocs(progressCol(uid));
  return new Set(
    snap.docs
      .filter((d) => Boolean(d.data().learnedAt))
      .map((d) => d.id)
  );
}

export async function getSavedWordIds(uid: string): Promise<Set<string>> {
  const snap = await getDocs(progressCol(uid));
  return new Set(
    snap.docs
      .filter((d) => Boolean(d.data().savedAt))
      .map((d) => d.id)
  );
}

export async function markWordSaved(uid: string, wordId: string, saved: boolean) {
  const ref = doc(progressCol(uid), wordId);
  if (saved) {
    await setDoc(ref, { wordId, savedAt: Date.now() }, { merge: true });
  } else {
    const current = await getDoc(ref);
    if (!current.exists()) return;
    const data = current.data();
    if (data.learnedAt) {
      await setDoc(ref, { wordId, learnedAt: data.learnedAt }, { merge: false });
    } else {
      await deleteDoc(ref);
    }
  }
}

export async function markWordLearned(uid: string, wordId: string, learned: boolean) {
  const ref = doc(progressCol(uid), wordId);
  if (learned) {
    await setDoc(ref, { wordId, learnedAt: Date.now() }, { merge: true });
    return;
  }
  const current = await getDoc(ref);
  if (!current.exists()) return;
  const data = current.data();
  if (data.savedAt) {
    await setDoc(ref, { wordId, savedAt: data.savedAt }, { merge: false });
  } else {
    await deleteDoc(ref);
  }
}
