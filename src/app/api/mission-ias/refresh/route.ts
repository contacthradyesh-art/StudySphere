import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { runCurrentAffairsRefresh } from '@/lib/mission-ias/refresh-service';

export const maxDuration = 60;

const COOLDOWN_MS = 2 * 60 * 1000; // shared cooldown across all users, prevents API-cost abuse

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

/** Manual refresh, triggered from the Current Affairs Hub's Refresh button. Any signed-in user can call it. */
export async function POST(req: NextRequest) {
  if (!adminDb) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const lockRef = adminDb.collection('appConfig').doc('currentAffairsRefresh');
  const lockSnap = await lockRef.get();
  const lastRun = lockSnap.exists ? (lockSnap.data()?.lastRun as number | undefined) : undefined;

  if (lastRun && Date.now() - lastRun < COOLDOWN_MS) {
    const waitSeconds = Math.ceil((COOLDOWN_MS - (Date.now() - lastRun)) / 1000);
    return NextResponse.json({ error: 'cooldown', waitSeconds }, { status: 429 });
  }

  await lockRef.set({ lastRun: Date.now() }, { merge: true });

  const results = await runCurrentAffairsRefresh();
  return NextResponse.json({ ok: true, ...results });
}