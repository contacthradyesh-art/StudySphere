import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { CURRENT_AFFAIRS_COLLECTION } from '@/lib/mission-ias/current-affairs-schema';

/**
 * Deletes all stored current-affairs items so the next /fetch-news run
 * re-summarizes everything with the latest schema/prompt (e.g. after adding
 * new fields like topic/examRelevance). Protected by the same CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  if (!adminDb) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const snap = await adminDb.collection(CURRENT_AFFAIRS_COLLECTION).get();
  const batchSize = 400;
  let deleted = 0;
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = adminDb.batch();
    docs.slice(i, i + batchSize).forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += Math.min(batchSize, docs.length - i);
  }

  return NextResponse.json({ ok: true, deleted });
}