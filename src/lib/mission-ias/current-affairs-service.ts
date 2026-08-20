import {
  collection, doc, onSnapshot, orderBy, query, limit as fbLimit,
  setDoc, deleteDoc, getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { CURRENT_AFFAIRS_COLLECTION, type CurrentAffairsItem } from '@/lib/mission-ias/current-affairs-schema';

/** Live-subscribes to the most recent current-affairs items (newest first). */
export function subscribeCurrentAffairs(cb: (items: CurrentAffairsItem[]) => void, max = 100) {
  const q = query(collection(db, CURRENT_AFFAIRS_COLLECTION), orderBy('publishedAt', 'desc'), fbLimit(max));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as CurrentAffairsItem));
  });
}

function bookmarksCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, 'bookmarkedNews');
}

export async function getBookmarkedIds(uid: string): Promise<Set<string>> {
  const snap = await getDocs(bookmarksCol(uid));
  return new Set(snap.docs.map((d) => d.id));
}

export async function toggleBookmark(uid: string, itemId: string, bookmarked: boolean) {
  const ref = doc(bookmarksCol(uid), itemId);
  if (bookmarked) await setDoc(ref, { itemId, savedAt: Date.now() });
  else await deleteDoc(ref);
}
