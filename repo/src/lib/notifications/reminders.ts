'use client';

/**
 * Study-reminder notifications using the Web Notifications API, delivered via
 * the registered service worker so they work even when the tab is backgrounded.
 */

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

/** Ask the user for notification permission. Returns the resulting state. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied';
  return Notification.requestPermission();
}

/** Show a notification now (used for immediate study nudges). */
export async function showReminder(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'studysphere-reminder'
  });
}

/**
 * Schedule a one-off in-session reminder after `minutes`. Returns a cancel
 * function. (For true scheduled/push delivery, wire FCM + a server trigger;
 * this covers client-side study nudges while the app is open.)
 */
export function scheduleReminder(minutes: number, title: string, body: string): () => void {
  const id = setTimeout(() => void showReminder(title, body), minutes * 60 * 1000);
  return () => clearTimeout(id);
}
