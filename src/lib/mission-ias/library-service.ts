import {
  addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, where
} from 'firebase/firestore';
import { deleteObject, ref, type UploadTaskSnapshot } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase/client';
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

export function subscribeLibraryFiles(uid: string, cb: (files: LibraryFile[]) => void) {
  const q = query(filesCol(uid), orderBy('uploadedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryFile));
  });
}

function getIdToken() {
  return auth.currentUser?.getIdToken() ?? Promise.reject(new Error('Not signed in'));
}

function uploadToCloudinary(
  file: File,
  signed: { timestamp: number; folder: string; signature: string; apiKey: string; cloudName: string },
  onProgress?: (percent: number) => void
): Promise<{ secure_url: string; public_id: string; resource_type: string; bytes: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`);
    xhr.responseType = 'json';
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new Error('Network error while uploading file'));
    xhr.onabort = () => reject(new Error('Upload cancelled'));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response?.secure_url) {
        resolve(xhr.response);
      } else {
        reject(new Error(xhr.response?.error?.message || `Cloudinary upload failed (${xhr.status})`));
      }
    };

    const form = new FormData();
    form.append('file', file);
    form.append('api_key', signed.apiKey);
    form.append('timestamp', String(signed.timestamp));
    form.append('folder', signed.folder);
    form.append('signature', signed.signature);
    xhr.send(form);
  });
}

/**
 * Uploads directly from the browser to Cloudinary using a short-lived server
 * signature. This avoids Vercel request-body limits and keeps the API secret
 * server-side. The Firestore record is written only after the upload succeeds.
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

  let cancelled = false;
  const promise = (async () => {
    const idToken = await getIdToken();
    const signRes = await fetch('/api/library/sign-upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const signed = await signRes.json();
    if (!signRes.ok) throw new Error(signed?.error || 'Could not prepare upload');
    if (cancelled) throw new Error('Upload cancelled');

    const result = await uploadToCloudinary(file, signed, onProgress);
    if (cancelled) throw new Error('Upload cancelled');

    const docRef = doc(filesCol(uid));
    const fileData: LibraryFile = {
      id: docRef.id,
      name: file.name,
      storagePath: result.public_id,
      downloadUrl: result.secure_url,
      resourceType: result.resource_type || 'raw',
      size: Number(result.bytes || file.size),
      type: file.type || 'application/octet-stream',
      subject: opts.subject,
      folderId: opts.folderId,
      favorite: false,
      uploadedAt: Date.now()
    };
    await setDoc(docRef, fileData);
    onProgress?.(100);
  })();

  return { promise, cancel: () => { cancelled = true; } };
}

export async function toggleLibraryFavorite(uid: string, fileId: string, favorite: boolean) {
  await updateDoc(doc(filesCol(uid), fileId), { favorite });
}

export async function moveLibraryFile(uid: string, fileId: string, folderId: string | null) {
  await updateDoc(doc(filesCol(uid), fileId), { folderId });
}

export async function deleteLibraryFile(uid: string, file: LibraryFile) {
  if (file.storagePath.startsWith(`users/${uid}/`)) {
    try { await deleteObject(ref(storage, file.storagePath)); } catch { /* legacy file may already be gone */ }
  } else {
    try {
      const idToken = await getIdToken();
      await fetch('/api/library/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ publicId: file.storagePath, resourceType: file.resourceType || 'raw' }),
      });
    } catch (error) {
      console.error('Cloudinary delete failed:', error);
    }
  }
  await deleteDoc(doc(filesCol(uid), file.id));
}

export async function updateReadingProgress(uid: string, fileId: string, lastPage: number, totalPages: number) {
  await updateDoc(doc(filesCol(uid), fileId), { lastPage, totalPages, lastOpenedAt: Date.now() });
}

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
  const filesSnap = await getDocs(query(filesCol(uid), where('folderId', '==', folderId)));
  await Promise.all(filesSnap.docs.map((d) => updateDoc(d.ref, { folderId: null })));
  await deleteDoc(doc(foldersCol(uid), folderId));
}

export function subscribeLibraryNotes(uid: string, fileId: string, cb: (notes: LibraryNote[]) => void) {
  const q = query(notesCol(uid, fileId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryNote)), (error) => {
    console.error('subscribeLibraryNotes error:', error);
    cb([]);
  });
}

export async function addLibraryNote(uid: string, fileId: string, page: number, text: string) {
  await addDoc(notesCol(uid, fileId), { page, text, createdAt: Date.now() });
}

export async function deleteLibraryNote(uid: string, fileId: string, noteId: string) {
  await deleteDoc(doc(notesCol(uid, fileId), noteId));
}

export function subscribeLibraryBookmarks(uid: string, fileId: string, cb: (bookmarks: LibraryBookmark[]) => void) {
  const q = query(bookmarksCol(uid, fileId), orderBy('page', 'asc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryBookmark)), (error) => {
    console.error('subscribeLibraryBookmarks error:', error);
    cb([]);
  });
}

export async function addLibraryBookmark(uid: string, fileId: string, page: number, label: string) {
  await addDoc(bookmarksCol(uid, fileId), { page, label, createdAt: Date.now() });
}

export async function deleteLibraryBookmark(uid: string, fileId: string, bookmarkId: string) {
  await deleteDoc(doc(bookmarksCol(uid, fileId), bookmarkId));
}
