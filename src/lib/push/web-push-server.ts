import webpush from 'web-push';

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:support@study-sphere-flax.vercel.app';
  if (!publicKey || !privateKey) {
    throw new Error('VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY env vars are missing');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Sends a push notification to one subscription. Returns 'ok', 'expired'
 * (subscription is dead and should be deleted), or 'error'.
 */
export async function sendPush(
  subscription: PushSubscriptionJSON,
  payload: PushPayload
): Promise<'ok' | 'expired' | 'error'> {
  ensureConfigured();
  try {
    await webpush.sendNotification(subscription as any, JSON.stringify(payload));
    return 'ok';
  } catch (err: any) {
    // 404/410 = the browser/device unsubscribed or the subscription expired.
    if (err?.statusCode === 404 || err?.statusCode === 410) return 'expired';
    console.error('web-push send failed', err?.statusCode, err?.body);
    return 'error';
  }
}
