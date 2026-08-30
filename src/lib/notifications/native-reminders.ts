'use client';

interface NativeReminderBridge {
  notificationsGranted?: () => boolean;
  requestNotificationPermission?: () => void;
  scheduleReminder?: (atMillis: number, title: string, body: string, requestCode: number) => boolean;
}

declare global {
  interface Window {
    StudySphereFocusShield?: NativeReminderBridge;
  }
}

export async function ensureStudyNotifications(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const native = window.StudySphereFocusShield;
  if (native?.notificationsGranted) {
    if (native.notificationsGranted()) return true;
    native.requestNotificationPermission?.();
    return false;
  }

  if ('Notification' in window) {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'default') return (await Notification.requestPermission()) === 'granted';
  }
  return false;
}

/**
 * Schedule a persistent Android alarm when running inside the APK.
 * Web fallback intentionally does not pretend that setTimeout survives app termination.
 */
export function schedulePersistentReminder(
  atMillis: number,
  title: string,
  body: string,
  requestCode: number
): boolean {
  if (typeof window === 'undefined') return false;
  const native = window.StudySphereFocusShield;
  if (!native?.scheduleReminder) return false;
  return native.scheduleReminder(atMillis, title, body, requestCode);
}
