import type { Timestamp } from 'firebase/firestore';

/**
 * Firestore data model for the Digital Diary & Journal (Milestone 5).
 * Collection (under users/{uid}):
 *   journalEntries/{entryId}
 *
 * Locked entries store ciphertext in `content` and set `locked: true` with the
 * crypto params needed to decrypt (salt + iv). The passphrase never leaves the
 * browser and is never stored.
 */

export const JOURNAL_COLLECTIONS = { journalEntries: 'journalEntries' } as const;

export type Mood = 'great' | 'good' | 'okay' | 'low' | 'bad';

export const MOODS: { id: Mood; label: string; emoji: string }[] = [
  { id: 'great', label: 'Great', emoji: '😄' },
  { id: 'good',  label: 'Good',  emoji: '🙂' },
  { id: 'okay',  label: 'Okay',  emoji: '😐' },
  { id: 'low',   label: 'Low',   emoji: '😔' },
  { id: 'bad',   label: 'Bad',   emoji: '😞' },
];

export interface JournalEntry {
  id: string;
  /** ISO date YYYY-MM-DD this entry is for. */
  date: string;
  title: string;
  /** Plaintext Markdown, or ciphertext when locked. */
  content: string;
  mood: Mood | null;
  gratitude: string[];
  reflection: string;
  locked: boolean;
  /** Base64 crypto params, present only when locked. */
  salt?: string;
  iv?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type NewJournalEntry = Pick<
  JournalEntry,
  'date' | 'title' | 'content' | 'mood' | 'gratitude' | 'reflection' | 'locked' | 'salt' | 'iv'
>;
