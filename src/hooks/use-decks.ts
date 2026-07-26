'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeDecks } from '@/lib/flashcards/flashcard-service';
import { useFlashcardStore } from '@/store/flashcard-store';

/** Subscribes the flashcard store to the current user's decks. */
export function useDecksSync() {
  const { user } = useAuth();
  const setDecks = useFlashcardStore((s) => s.setDecks);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeDecks(user.uid, setDecks);
    return () => unsub();
  }, [user, setDecks]);
}
