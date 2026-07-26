'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeEntries } from '@/lib/journal/journal-service';
import { useJournalStore } from '@/store/journal-store';

/** Subscribes the journal store to the current user's Firestore entries. */
export function useJournalSync() {
  const { user } = useAuth();
  const setEntries = useJournalStore((s) => s.setEntries);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeEntries(user.uid, setEntries);
    return () => unsub();
  }, [user, setEntries]);
}
