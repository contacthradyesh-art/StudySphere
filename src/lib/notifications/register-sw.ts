'use client';

/** Register the PWA service worker once on the client. */
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch {
    // Registration failures are non-fatal; the app still works without PWA.
  }
}
