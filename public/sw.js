/* StudySphere service worker: cache public static assets only. */
const CACHE = 'studysphere-static-v2';
const OWNED_CACHE_PREFIX = 'studysphere-';
const APP_SHELL = ['/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(OWNED_CACHE_PREFIX) && key !== CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/*
 * Never cache HTML navigations or API responses. In particular, dashboard
 * pages can contain private student data and must always be fetched online.
 * Only cache public, same-origin static assets for an offline-friendly shell.
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/data/')) return;

  const isPublicStaticAsset =
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/favicon.ico';

  if (!isPublicStaticAsset) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
      }
      return response;
    })
  );
});

/* Receive push payloads (when FCM/web-push is wired server-side). */
self.addEventListener('push', (event) => {
  let data = { title: 'StudySphere', body: 'Time to study!' };
  try {
    if (event.data) data = event.data.json();
  } catch {
    /* Keep the default notification. */
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'studysphere-reminder'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/dashboard'));
});
