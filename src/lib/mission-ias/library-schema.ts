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
  /** Path inside Firebase Storage, used to delete the underlying file too. */
  storagePath: string;
  /** Public download URL from Storage. */
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