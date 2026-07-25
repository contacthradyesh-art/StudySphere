import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Returns the current user's ID.
 * Uses the authenticated Firebase user's uid when signed in,
 * otherwise falls back to a static demo user (useful before auth loads,
 * or if Firebase Auth isn't configured yet).
 */
export function getCurrentUserId(): string {
  const user = useAuthStore.getState().user;
  return user?.uid ?? "demo-user";
}
