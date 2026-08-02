import {
  addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
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

/**
 * Uploads a file directly from the browser to Cloudinary (using a short-lived
 * signature from our server, which never exposes the Cloudinary secret),
 * then saves the resulting metadata to Firestore.
 */
export async function uploadLibraryFile(
  uid: string,
  file: File,
  opts: { subject: LibraryFile['subject']; folderId: string | null }
): Promise<void> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('Not signed in');

  const signRes = await fetch('/api/library/sign-upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` }
  });
  if (!signRes.ok) throw new Error('Could not authorize upload');
  const { timestamp, folder, signature, apiKey, cloudName } = await signRes.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData
  });
  if (!uploadRes.ok) throw new Error('Upload to Cloudinary failed');
  const uploaded = await uploadRes.json();

  await addDoc(filesCol(uid), {
    name: file.name,
    publicId: uploaded.public_id,
    resourceType: uploaded.resource_type === 'image' ? 'image' : 'raw',
    downloadUrl: uploaded.secure_url,
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
  const idToken = await auth.currentUser?.getIdToken();
  if (idToken) {
    try {
      await fetch('/api/library/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ publicId: file.publicId, resourceType: file.resourceType })
      });
    } catch {
      // Continue removing the Firestore record even if the Cloudinary delete call fails —
      // an orphaned file in Cloudinary storage is a minor cleanup issue, not a UX blocker.
    }
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

/** Deletes a folder. Files inside it are NOT deleted — they're moved back to "All Files" so nothing is lost. */
export async function deleteLibraryFolder(uid: string, folderId: string) {
  const filesSnap = await getDocs(query(filesCol(uid), where('folderId', '==', folderId)));
  await Promise.all(filesSnap.docs.map((d) => updateDoc(d.ref, { folderId: null })));
  await deleteDoc(doc(foldersCol(uid), folderId));
}