'use client';

/** Register the PWA service worker once on the client — production only.
 * In development this caused stale JS to be served from cache even after
 * code changes and server restarts, making working code look broken (e.g.
 * clicks/option-selection appearing to silently do nothing). */
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (process.env.NODE_ENV !== 'production') {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {
      // best-effort cleanup only
    }
    return;
  }
  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch {
    // Registration failures are non-fatal; the app still works without PWA.
  }
}