import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import {
  LIBRARY_FILES_COLLECTION, LIBRARY_FOLDERS_COLLECTION,
  type LibraryFile, type LibraryFolder
} from './library-schema';

function filesCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, LIBRARY_FILES_COLLECTION);
}
function foldersCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, LIBRARY_FOLDERS_COLLECTION);
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

/** Live-subscribe to a user's library files, newest first. */
export function subscribeLibraryFiles(uid: string, cb: (files: LibraryFile[]) => void) {
  const q = query(filesCol(uid), orderBy('uploadedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryFile));
  });
}

/** Uploads a file to Firebase Storage and creates its Firestore metadata doc. */
export async function uploadLibraryFile(
  uid: string,
  file: File,
  opts: { subject: LibraryFile['subject']; folderId: string | null }
): Promise<void> {
  const storagePath = `library/${uid}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);

  await addDoc(filesCol(uid), {
    name: file.name,
    storagePath,
    downloadUrl,
    size: file.size,
    type: file.type || 'application/octet-stream',
    subject: opts.subject,
    folderId: opts.folderId,
    favorite: false,
    uploadedAt: Date.now()
  });
}

export async function toggleLibraryFavorite(uid: string, fileId: string, favorite: boolean) {
  await updateDoc(doc(filesCol(uid), fileId), { favorite });
}

export async function moveLibraryFile(uid: string, fileId: string, folderId: string | null) {
  await updateDoc(doc(filesCol(uid), fileId), { folderId });
}

export async function deleteLibraryFile(uid: string, file: LibraryFile) {
  try {
    await deleteObject(ref(storage, file.storagePath));
  } catch {
    // File may already be gone from Storage; still remove the metadata doc.
  }
  await deleteDoc(doc(filesCol(uid), file.id));
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

export function subscribeLibraryFolders(uid: string, cb: (folders: LibraryFolder[]) => void) {
  const q = query(foldersCol(uid), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryFolder));
  });
}

export async function createLibraryFolder(uid: string, name: string) {
  await addDoc(foldersCol(uid), { name, createdAt: Date.now() });
}

export async function deleteLibraryFolder(uid: string, folderId: string) {
  await deleteDoc(doc(foldersCol(uid), folderId));
}