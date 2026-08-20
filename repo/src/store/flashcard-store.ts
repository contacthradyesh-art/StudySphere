import { create } from 'zustand';
import type { Deck } from '@/lib/firestore/flashcard-schema';

interface FlashcardState {
  decks: Deck[];
  loading: boolean;
  setDecks: (decks: Deck[]) => void;
}

/** Client cache of the user's flashcard decks. */
export const useFlashcardStore = create<FlashcardState>((set) => ({
  decks: [],
  loading: true,
  setDecks: (decks) => set({ decks, loading: false })
}));
