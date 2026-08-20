import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import type { Attachment } from '@/lib/firestore/notes-schema';

function classify(file: File): Attachment['type'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'pdf';
}

/**
 * Upload a note attachment to users/{uid}/notes/{noteId}/{filename}.
 * Storage rules (storage.rules) already restrict this path to the owner.
 */
export async function uploadAttachment(uid: string, noteId: string, file: File): Promise<Attachment> {
  const path = `users/${uid}/notes/${noteId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { name: file.name, url, type: classify(file), size: file.size, uploadedAt: Date.now() };
}
