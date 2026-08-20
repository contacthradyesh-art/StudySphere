'use client';

import type { User } from 'firebase/auth';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export type PushStatus = 'unsupported' | 'denied' | 'subscribed' | 'not-subscribed';

export function getPushSupportStatus(): 'unsupported' | 'supported' {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  return 'supported';
}

export async function getCurrentPushStatus(): Promise<PushStatus> {
  if (getPushSupportStatus() === 'unsupported') return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  if (!reg) return 'not-subscribed';
  const sub = await reg.pushManager.getSubscription();
  return sub ? 'subscribed' : 'not-subscribed';
}

/** Requests notification permission (if needed), subscribes this device, and saves it server-side. */
export async function enableBackgroundReminders(user: User): Promise<{ ok: boolean; error?: string }> {
  if (getPushSupportStatus() === 'unsupported') return { ok: false, error: 'Push notifications are not supported on this browser/device.' };

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return { ok: false, error: 'Push is not configured on the server yet.' };

  let permission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, error: 'Notification permission was not granted.' };

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey)
    });
  }

  const idToken = await user.getIdToken();
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ subscription: sub.toJSON() })
  });
  if (!res.ok) return { ok: false, error: 'Could not save subscription on the server.' };
  return { ok: true };
}

export async function disableBackgroundReminders(user: User): Promise<void> {
  if (getPushSupportStatus() === 'unsupported') return;
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => {});
  const idToken = await user.getIdToken();
  await fetch('/api/push/subscribe', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ endpoint })
  }).catch(() => {});
}
