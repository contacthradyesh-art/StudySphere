import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { runCurrentAffairsRefresh } from '@/lib/mission-ias/refresh-service';
import { HINDI_CURRENT_AFFAIRS } from '@/lib/mission-ias/hindi-current-affairs';

export const maxDuration = 60;
const COOLDOWN_MS = 2 * 60 * 1000;

async function getUidFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken || !adminAuth) return null;
  try { return (await adminAuth.verifyIdToken(idToken)).uid; } catch { return null; }
}

/** Manual refresh. Live RSS/AI data is preferred; the curated Hindi set is persisted if the live pipeline returns no new items. */
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

  after(async () => {
    try {
      const results = await runCurrentAffairsRefresh();
      if (results.added === 0) {
        const batch = adminDb.batch();
        for (const item of HINDI_CURRENT_AFFAIRS) {
          batch.set(adminDb.collection('currentAffairs').doc(item.id), item, { merge: true });
        }
        await batch.commit();
      }
      console.log('Current affairs refresh finished', results);
    } catch (err) {
      console.error('Current affairs refresh failed', err);
      try {
        const batch = adminDb.batch();
        for (const item of HINDI_CURRENT_AFFAIRS) batch.set(adminDb.collection('currentAffairs').doc(item.id), item, { merge: true });
        await batch.commit();
      } catch (seedErr) { console.error('Hindi current affairs seed failed', seedErr); }
    }
  });

  return NextResponse.json({ ok: true, started: true });
}
