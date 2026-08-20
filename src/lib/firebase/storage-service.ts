import { storage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export async function uploadFile(
  uid: string,
  subject: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ downloadUrl: string; storagePath: string }> {
  const path = `users/${uid}/subjects/${subject}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file);
    
    task.on('state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      (error) => reject(error),
      async () => {
        const downloadUrl = await getDownloadURL(task.snapshot.ref);
        resolve({ downloadUrl, storagePath: path });
      }
    );
  });
}

export async function deleteFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}