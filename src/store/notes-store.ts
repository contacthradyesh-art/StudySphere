import { create } from 'zustand';
import type { Note } from '@/lib/firestore/notes-schema';

interface NotesState {
  notes: Note[];
  loading: boolean;
  search: string;
  subjectFilter: string;
  setNotes: (notes: Note[]) => void;
  setSearch: (search: string) => void;
  setSubjectFilter: (subject: string) => void;
}

/** Client cache of the live notes list + current search query and subject filter. */
export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  loading: true,
  search: '',
  subjectFilter: '',
  setNotes: (notes) => set({ notes, loading: false }),
  setSearch: (search) => set({ search }),
  setSubjectFilter: (subjectFilter) => set({ subjectFilter })
}));

/** Filter notes by free-text query across title, content, tags, subject and category. */
export function filterNotes(notes: Note[], q: string): Note[] {
  const term = q.trim().toLowerCase();
  if (!term) return notes;
  return notes.filter((n) =>
    n.title.toLowerCase().includes(term) ||
    n.content.toLowerCase().includes(term) ||
    n.tags.some((t) => t.toLowerCase().includes(term)) ||
    (n.subject?.toLowerCase().includes(term) ?? false) ||
    (n.category?.toLowerCase().includes(term) ?? false)
  );
}

/** Restrict notes to a single subject (empty string = all subjects). */
export function bySubject(notes: Note[], subject: string): Note[] {
  if (!subject) return notes;
  return notes.filter((n) => n.subject === subject);
}
