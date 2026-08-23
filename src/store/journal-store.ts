import { create } from 'zustand';
import type { JournalEntry } from '@/lib/firestore/journal-schema';

interface JournalState {
  entries: JournalEntry[];
  loading: boolean;
  search: string;
  setEntries: (entries: JournalEntry[]) => void;
  setSearch: (search: string) => void;
}

/** Client cache of journal entries + current search query. */
export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  loading: true,
  search: '',
  setEntries: (entries) => set({ entries, loading: false }),
  setSearch: (search) => set({ search })
}));

/** Filter unlocked entries by query (locked entries match on title/date only). */
export function filterEntries(entries: JournalEntry[], q: string): JournalEntry[] {
  const term = q.trim().toLowerCase();
  if (!term) return entries;
  return entries.filter((e) => {
    if (e.title.toLowerCase().includes(term) || e.date.includes(term)) return true;
    if (e.locked) return false;
    return (
      e.content.toLowerCase().includes(term) ||
      e.reflection.toLowerCase().includes(term) ||
      e.gratitude.some((g) => g.toLowerCase().includes(term))
    );
  });
}
