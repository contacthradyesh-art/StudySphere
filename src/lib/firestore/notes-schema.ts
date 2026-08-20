import type { Timestamp } from 'firebase/firestore';
import type { Subject } from '@/lib/firestore/planner-schema';

/**
 * Firestore data model for Notes + Subjects (Milestone 4).
 * Collections (under users/{uid}):
 *   notes/{noteId}                         - a markdown note + attachments
 *   notes/{noteId}/versions/{versionId}    - immutable snapshots on each edit
 *   subjects/{subjectId}                   - per-subject metadata + progress
 */

export const NOTES_COLLECTIONS = {
  notes: 'notes',
  versions: 'versions',
  subjects: 'subjects'
} as const;

export interface Attachment {
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'audio';
  size: number;
  uploadedAt: number; // epoch ms
}

export interface Note {
  id: string;
  title: string;
  /** Markdown body. */
  content: string;
  subject: Subject | null;
  category: string | null;
  tags: string[];
  attachments: Attachment[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type NewNote = Pick<Note, 'title' | 'content' | 'subject' | 'category' | 'tags'>;

/** Immutable snapshot stored before an edit overwrites the note. */
export interface NoteVersion {
  id: string;
  title: string;
  content: string;
  savedAt: Timestamp | null;
}

export interface SubjectMeta {
  id: string;       // Subject name as document id
  name: Subject;
  importantTopics: string[];
  /** 0-100 progress used by the dashboard. */
  progress: number;
  noteCount: number;
  updatedAt: Timestamp | null;
}
