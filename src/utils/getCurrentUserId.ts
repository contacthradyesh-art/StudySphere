import { auth } from "@/lib/firebase/client";

/**
 * Returns the current signed-in user's Firebase UID.
 * Throws if called with no authenticated user — callers run only from
 * client components/pages already gated behind auth (see use-auth.tsx),
 * so a null user here means the call site is missing that guard.
 */
export function getCurrentUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error(
      "getCurrentUserId(): no authenticated user. Call this only after auth is ready (see useAuth())."
    );
  }
  return uid;
}
