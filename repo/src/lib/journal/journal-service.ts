import {
  addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { JOURNAL_COLLECTIONS, type JournalEntry, type NewJournalEntry } from '@/lib/firestore/journal-schema';

function entriesCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, JOURNAL_COLLECTIONS.journalEntries);
}

/** Live-subscribe to journal entries, newest date first. */
export function subscribeEntries(uid: string, cb: (entries: JournalEntry[]) => void) {
  const q = query(entriesCol(uid), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as JournalEntry)));
}

export async function getEntry(uid: string, entryId: string): Promise<JournalEntry | null> {
  const snap = await getDoc(doc(entriesCol(uid), entryId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as JournalEntry) : null;
}

export async function createEntry(uid: string, data: NewJournalEntry): Promise<string> {
  const ref = await addDoc(entriesCol(uid), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateEntry(uid: string, entryId: string, patch: Partial<NewJournalEntry>) {
  await updateDoc(doc(entriesCol(uid), entryId), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteEntry(uid: string, entryId: string) {
  await deleteDoc(doc(entriesCol(uid), entryId));
}
