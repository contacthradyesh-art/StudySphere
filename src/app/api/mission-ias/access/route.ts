import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE = 'mission_ias_access';
const MAX_AGE = 60 * 60 * 24 * 30;

function getPassword() {
  return process.env.MISSION_IAS_ACCESS_PASSWORD?.trim() || '';
}

function sign(payload: string, password: string) {
  return createHmac('sha256', password).update(payload).digest('base64url');
}

function validToken(token: string | undefined, password: string) {
  if (!token || !password) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = sign(payload, password);
  if (signature.length !== expected.length) return false;
  const same = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  const expires = Number(payload);
  return same && Number.isFinite(expires) && expires > Math.floor(Date.now() / 1000);
}

export async function GET() {
  const password = getPassword();
  const store = await cookies();
  const unlocked = validToken(store.get(COOKIE)?.value, password);
  return NextResponse.json({ unlocked });
}

export async function POST(request: Request) {
  const configuredPassword = getPassword();
  if (!configuredPassword) {
    return NextResponse.json({ error: 'Mission IAS lock is not configured on the server.' }, { status: 503 });
  }

  let password = '';
  try {
    const body = await request.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const a = createHash('sha256').update(password).digest();
  const b = createHash('sha256').update(configuredPassword).digest();
  if (!timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Incorrect Mission IAS password.' }, { status: 401 });
  }

  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = String(expires);
  const token = `${payload}.${sign(payload, configuredPassword)}`;
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.set(COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
