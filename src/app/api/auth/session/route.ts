import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'ss_session';
const MAX_AGE = 60 * 60 * 24 * 5; // 5 days

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing idToken' },
        { status: 400 }
      );
    }

    const sessionCookie = await createSessionCookie(idToken);

    const store = await cookies();

    store.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE
    });

    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);

  return NextResponse.json({ status: 'ok' });
}