'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
 * Auto-expires itself with a live timer once `endsAt` passes, instead of
 * only checking on page load.
 */
export function useFocusShieldState() {
  const [state, setState] = useState<FocusShieldState>(DEFAULT_STATE);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const endSession = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState(DEFAULT_STATE);
    save(DEFAULT_STATE);
  }, []);

  useEffect(() => {
    setState(load());
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setState(load());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Schedule an auto-expire the moment `endsAt` is reached, instead of
  // waiting for the next page load/reload to notice.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (state.active && state.endsAt) {
      const msLeft = state.endsAt - Date.now();
      if (msLeft <= 0) {
        endSession();
      } else {
        timerRef.current = setTimeout(endSession, msLeft);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.active, state.endsAt, endSession]);

  const startSession = useCallback((durationMinutes: number, blockedCount: number) => {
    const next: FocusShieldState = {
      active: true,
      endsAt: Date.now() + durationMinutes * 60 * 1000,
      blockedCount,
    };
    setState(next);
    save(next);
  }, []);

  return { ...state, startSession, endSession };
}