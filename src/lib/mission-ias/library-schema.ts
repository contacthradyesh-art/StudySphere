import type { UpscCategory } from './current-affairs-schema';

export const LIBRARY_FILES_COLLECTION = 'libraryFiles';
export const LIBRARY_FOLDERS_COLLECTION = 'libraryFolders';
export const LIBRARY_NOTES_SUBCOLLECTION = 'notes';
export const LIBRARY_BOOKMARKS_SUBCOLLECTION = 'bookmarks';

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
  /** Cloudinary public ID; legacy Firebase Storage paths are also supported for old files. */
  storagePath: string;
  /** Secure download URL returned by Cloudinary/Firebase Storage. */
  downloadUrl: string;
  /** Cloudinary resource type (image/raw/video) for server-side deletion. */
  resourceType?: string;
  size: number;
  type: string;
  subject: UpscCategory | null;
  folderId: string | null;
  favorite: boolean;
  uploadedAt: number;
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
