import {
  addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, type UploadTaskSnapshot } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import {
  LIBRARY_FILES_COLLECTION, LIBRARY_FOLDERS_COLLECTION, LIBRARY_NOTES_SUBCOLLECTION,
  LIBRARY_BOOKMARKS_SUBCOLLECTION, MAX_UPLOAD_SIZE_BYTES,
  type LibraryFile, type LibraryFolder, type LibraryNote, type LibraryBookmark
} from './library-schema';

function filesCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, LIBRARY_FILES_COLLECTION);
}
function foldersCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, LIBRARY_FOLDERS_COLLECTION);
}
function notesCol(uid: string, fileId: string) {
  return collection(db, COLLECTIONS.users, uid, LIBRARY_FILES_COLLECTION, fileId, LIBRARY_NOTES_SUBCOLLECTION);
}
function bookmarksCol(uid: string, fileId: string) {
  return collection(db, COLLECTIONS.users, uid, LIBRARY_FILES_COLLECTION, fileId, LIBRARY_BOOKMARKS_SUBCOLLECTION);
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

/**
 * Uploads a file directly from the browser to Firebase Storage using a
 * resumable upload — the file is streamed straight to Storage, never
 * buffered through a server route, so there's no Vercel body-size limit
 * and no Cloudinary free-plan size cap. Progress is reported via onProgress
 * (0-100) so the UI can show a live progress bar.
 */
export function uploadLibraryFile(
  uid: string,
  file: File,
  opts: { subject: LibraryFile['subject']; folderId: string | null },
  onProgress?: (percent: number) => void
): { promise: Promise<void>; cancel: () => void } {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      promise: Promise.reject(new Error(`File exceeds the ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)}MB limit`)),
      cancel: () => {}
    };
  }

  const docId = doc(filesCol(uid)).id;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Must live under users/{uid}/... — storage.rules only grants read/write
  // to that prefix. This used to be `library/${uid}/...`, which doesn't
  // match the rule at all, so every upload was silently rejected by
  // Firebase Storage with a permission-denied error before it ever reached
  // the progress callback.
  const storagePath = `users/${uid}/library/${docId}-${safeName}`;
  const storageRef = ref(storage, storagePath);
  const task = uploadBytesResumable(storageRef, file);

  const promise = new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snap: UploadTaskSnapshot) => {
        if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      },
      (err) => reject(err),
      async () => {
        try {
          const downloadUrl = await getDownloadURL(storageRef);
          const fileData: LibraryFile = {
            id: docId,
            name: file.name,
            storagePath,
            downloadUrl,
            size: file.size,
            type: file.type || 'application/octet-stream',
            subject: opts.subject,
            folderId: opts.folderId,
            favorite: false,
            uploadedAt: Date.now()
          };
          await addDoc(filesCol(uid), fileData);
          resolve();
        } catch (err) {
          reject(err);
        }
      }
    );
  });

  return { promise, cancel: () => task.cancel() };
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
    // If the file is already gone from Storage, still clean up the Firestore record.
  }
  await deleteDoc(doc(filesCol(uid), file.id));
}

/** Debounced by the caller (reader component) — not called on every page turn directly. */
export async function updateReadingProgress(uid: string, fileId: string, lastPage: number, totalPages: number) {
  await updateDoc(doc(filesCol(uid), fileId), { lastPage, totalPages, lastOpenedAt: Date.now() });
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

/** Deletes a folder. Files inside it are NOT deleted — they're moved back to "All Files" so nothing is lost. */
export async function deleteLibraryFolder(uid: string, folderId: string) {
  const filesSnap = await getDocs(query(filesCol(uid), where('folderId', '==', folderId)));
  await Promise.all(filesSnap.docs.map((d) => updateDoc(d.ref, { folderId: null })));
  await deleteDoc(doc(foldersCol(uid), folderId));
}

// ---------------------------------------------------------------------------
// Notes (per file, per page)
// ---------------------------------------------------------------------------

export function subscribeLibraryNotes(uid: string, fileId: string, cb: (notes: LibraryNote[]) => void) {
  const q = query(notesCol(uid, fileId), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryNote)),
    (error) => { console.error('subscribeLibraryNotes error:', error); cb([]); }
  );
}

export async function addLibraryNote(uid: string, fileId: string, page: number, text: string) {
  await addDoc(notesCol(uid, fileId), { page, text, createdAt: Date.now() });
}

export async function deleteLibraryNote(uid: string, fileId: string, noteId: string) {
  await deleteDoc(doc(notesCol(uid, fileId), noteId));
}

// ---------------------------------------------------------------------------
// Bookmarks (per file, per page)
// ---------------------------------------------------------------------------

export function subscribeLibraryBookmarks(uid: string, fileId: string, cb: (bookmarks: LibraryBookmark[]) => void) {
  const q = query(bookmarksCol(uid, fileId), orderBy('page', 'asc'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryBookmark)),
    (error) => { console.error('subscribeLibraryBookmarks error:', error); cb([]); }
  );
}

export async function addLibraryBookmark(uid: string, fileId: string, page: number, label: string) {
  await addDoc(bookmarksCol(uid, fileId), { page, label, createdAt: Date.now() });
}

export async function deleteLibraryBookmark(uid: string, fileId: string, bookmarkId: string) {
  await deleteDoc(doc(bookmarksCol(uid, fileId), bookmarkId));
}