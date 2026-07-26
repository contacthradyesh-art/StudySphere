'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeNotes } from '@/lib/notes/notes-service';
import { useNotesStore } from '@/store/notes-store';

/** Subscribes the notes store to the current user's Firestore notes. */
export function useNotesSync() {
  const { user } = useAuth();
  const setNotes = useNotesStore((s) => s.setNotes);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeNotes(user.uid, setNotes);
    return () => unsub();
  }, [user, setNotes]);
}
