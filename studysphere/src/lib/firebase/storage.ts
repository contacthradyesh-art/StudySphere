import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

export async function uploadFile(
  path: string, file: File | Blob, metadata?: Record<string, string>
): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadMetadata = metadata ? { customMetadata: metadata } : undefined;
  await uploadBytes(storageRef, file, uploadMetadata);
  return getDownloadURL(storageRef);
}

export async function uploadBase64(path: string, base64Data: string, mimeType: string): Promise<string> {
  const storageRef = ref(storage, path);
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export function generateFilePath(userId: string, folder: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `users/${userId}/${folder}/${timestamp}_${sanitizedName}`;
}
