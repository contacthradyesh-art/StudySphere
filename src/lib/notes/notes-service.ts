import {
  addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { NOTES_COLLECTIONS, type Attachment, type NewNote, type Note } from '@/lib/firestore/notes-schema';

function notesCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, NOTES_COLLECTIONS.notes);
}
function versionsCol(uid: string, noteId: string) {
  return collection(db, COLLECTIONS.users, uid, NOTES_COLLECTIONS.notes, noteId, NOTES_COLLECTIONS.versions);
}

/** Live-subscribe to a user's notes, most recently updated first. */
export function subscribeNotes(uid: string, cb: (notes: Note[]) => void) {
  const q = query(notesCol(uid), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Note)));
}

export async function getNote(uid: string, noteId: string): Promise<Note | null> {
  const snap = await getDoc(doc(notesCol(uid), noteId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Note) : null;
}

export async function createNote(uid: string, data: NewNote): Promise<string> {
  const ref = await addDoc(notesCol(uid), {
    ...data,
    attachments: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

/** Update a note, first snapshotting the previous content into versions/. */
export async function updateNote(uid: string, noteId: string, patch: Partial<NewNote>) {
  const prev = await getNote(uid, noteId);
  if (prev) {
    await addDoc(versionsCol(uid, noteId), {
      title: prev.title,
      content: prev.content,
      savedAt: serverTimestamp()
    });
  }
  await updateDoc(doc(notesCol(uid), noteId), { ...patch, updatedAt: serverTimestamp() });
}

export async function addAttachment(uid: string, noteId: string, attachment: Attachment) {
  const note = await getNote(uid, noteId);
  const next = [...(note?.attachments ?? []), attachment];
  await updateDoc(doc(notesCol(uid), noteId), { attachments: next, updatedAt: serverTimestamp() });
}

export async function deleteNote(uid: string, noteId: string) {
  await deleteDoc(doc(notesCol(uid), noteId));
}
