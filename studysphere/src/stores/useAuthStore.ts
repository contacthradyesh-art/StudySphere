"use client";
import { create } from "zustand";
import type { User } from "firebase/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  setUser: (user) => set({ user, isLoading: false }),
  setInitialized: () => set({ isInitialized: true }),
}));
