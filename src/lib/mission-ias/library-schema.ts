import type { UpscCategory } from './current-affairs-schema';

export const LIBRARY_FILES_COLLECTION = 'libraryFiles';
export const LIBRARY_FOLDERS_COLLECTION = 'libraryFolders';

export interface LibraryFolder {
  id: string;
  name: string;
  createdAt: number;
}

export interface LibraryFile {
  id: string;
  name: string;
  /** Cloudinary's identifier for this asset, used to delete it later. */
  publicId: string;
  /** "image" or "raw" (PDFs/docs) — Cloudinary needs this to delete correctly. */
  resourceType: 'image' | 'raw';
  /** Public download/view URL from Cloudinary. */
  downloadUrl: string;
  /** File size in bytes. */
  size: number;
  /** MIME type, e.g. "application/pdf". */
  type: string;
  subject: UpscCategory | null;
  folderId: string | null;
  favorite: boolean;
  uploadedAt: number;
}