import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

async function getUidFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken || !adminAuth) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

function subIdFor(endpoint: string): string {
  // Stable, filesystem-safe doc id derived from the subscription endpoint,
  // so re-subscribing the same device overwrites rather than duplicates.
  return Buffer.from(endpoint).toString('base64url').slice(-120);
}

export async function POST(req: NextRequest) {
  if (!adminDb) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const subscription = body?.subscription;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  const id = subIdFor(subscription.endpoint);
  await adminDb
    .collection('users')
    .doc(uid)
    .collection('pushSubscriptions')
    .doc(id)
    .set({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      updatedAt: Date.now()
    });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!adminDb) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint;
  if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });

  const id = subIdFor(endpoint);
  await adminDb.collection('users').doc(uid).collection('pushSubscriptions').doc(id).delete();

  return NextResponse.json({ ok: true });
}
