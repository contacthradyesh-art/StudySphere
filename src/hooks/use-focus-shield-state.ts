'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'focus-shield-state-v1';

interface FocusShieldState {
  active: boolean;
  endsAt: number | null;
  blockedCount: number;
}

const DEFAULT_STATE: FocusShieldState = { active: false, endsAt: null, blockedCount: 0 };

function load(): FocusShieldState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FocusShieldState;
      // Auto-expire if the saved end time has already passed.
      if (parsed.active && parsed.endsAt && parsed.endsAt < Date.now()) {
        return DEFAULT_STATE;
      }
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_STATE;
}

function save(state: FocusShieldState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/**
 * Shared Focus Shield session state, persisted to localStorage so it's visible
 * both on the dedicated Focus Shield page and the dashboard preview widget.
 * Listens for the `storage` event so multiple tabs/components stay in sync.
 */
export function useFocusShieldState() {
  const [state, setState] = useState<FocusShieldState>(DEFAULT_STATE);

  useEffect(() => {
    setState(load());
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setState(load());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const startSession = useCallback((durationMinutes: number, blockedCount: number) => {
    const next: FocusShieldState = {
      active: true,
      endsAt: Date.now() + durationMinutes * 60 * 1000,
      blockedCount,
    };
    setState(next);
    save(next);
  }, []);

  const endSession = useCallback(() => {
    setState(DEFAULT_STATE);
    save(DEFAULT_STATE);
  }, []);

  return { ...state, startSession, endSession };
}