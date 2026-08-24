import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * Verifies the Firebase ID token on an incoming API request. Every route
 * that calls a paid/rate-limited external API (Gemini, Anthropic, etc.)
 * MUST call this first — otherwise anyone on the internet can hit the
 * route and burn the server's API key/quota without ever signing in.
 * Returns the verified uid, or a 401 NextResponse to return immediately.
 */
export async function verifyRequestAuth(req: NextRequest): Promise<{ uid: string } | NextResponse> {
  if (!adminAuth) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }
  const authHeader = req.headers.get('authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { uid } = await adminAuth.verifyIdToken(idToken);
    return { uid };
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}
