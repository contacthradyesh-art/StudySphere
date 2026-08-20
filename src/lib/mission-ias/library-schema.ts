import type { UpscCategory } from './current-affairs-schema';

export const LIBRARY_FILES_COLLECTION = 'libraryFiles';
export const LIBRARY_FOLDERS_COLLECTION = 'libraryFolders';
export const LIBRARY_NOTES_SUBCOLLECTION = 'notes';
export const LIBRARY_BOOKMARKS_SUBCOLLECTION = 'bookmarks';

// Configurable in one place, per the "don't hardcode in many places" requirement.
export const MAX_UPLOAD_SIZE_MB = 500;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export interface LibraryFolder {
  id: string;
  name: string;
  createdAt: number;
}

export interface LibraryFile {
  id: string;
  name: string;
  /** Firebase Storage path, used to delete the file later. */
  storagePath: string;
  /** Public download URL from Firebase Storage. */
  downloadUrl: string;
  /** File size in bytes. */
  size: number;
  /** MIME type, e.g. "application/pdf". */
  type: string;
  subject: UpscCategory | null;
  folderId: string | null;
  favorite: boolean;
  uploadedAt: number;
  // Reading state — only meaningful for PDFs, absent/undefined otherwise.
  lastPage?: number;
  totalPages?: number;
  lastOpenedAt?: number;
}

export interface LibraryNote {
  id: string;
  page: number;
  text: string;
  createdAt: number;
}

export interface LibraryBookmark {
  id: string;
  page: number;
  label: string;
  createdAt: number;
}