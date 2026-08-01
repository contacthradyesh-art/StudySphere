import { NextRequest, NextResponse } from 'next/server';
import { runCurrentAffairsRefresh } from '@/lib/mission-ias/refresh-service';

export const maxDuration = 60;

/**
 * Called automatically once a day by Vercel Cron (see vercel.json), which
 * sends the CRON_SECRET as an Authorization: Bearer header. The `secret`
 * query param is also accepted, for manual/browser testing.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const bearerSecret = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const querySecret = req.nextUrl.searchParams.get('secret');
  const provided = bearerSecret || querySecret;

  if (!process.env.CRON_SECRET || provided !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await runCurrentAffairsRefresh();
    return NextResponse.json({ ok: true, ...results });
  } catch {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }
}