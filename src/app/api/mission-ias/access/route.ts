import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE = 'mission_ias_access';
const MAX_AGE = 60 * 60 * 24 * 30;
const MAX_WRONG_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000;

type PasswordAttempt = { wrongAttempts: number; blockedUntil: number };
const globalAttempts = globalThis as typeof globalThis & {
  __missionIasPasswordAttempts?: Map<string, PasswordAttempt>;
};
const passwordAttempts =
  globalAttempts.__missionIasPasswordAttempts ?? new Map<string, PasswordAttempt>();
globalAttempts.__missionIasPasswordAttempts = passwordAttempts;

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

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
  const clientIp = getClientIp(request);
  const attempt = passwordAttempts.get(clientIp);
  const now = Date.now();

  if (attempt?.blockedUntil && attempt.blockedUntil > now) {
    const retryAfter = Math.max(1, Math.ceil((attempt.blockedUntil - now) / 1000));
    return NextResponse.json(
      { error: 'Too many incorrect attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  if (attempt?.blockedUntil && attempt.blockedUntil <= now) {
    passwordAttempts.delete(clientIp);
  }

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
    const next = passwordAttempts.get(clientIp) ?? { wrongAttempts: 0, blockedUntil: 0 };
    next.wrongAttempts += 1;
    if (next.wrongAttempts >= MAX_WRONG_ATTEMPTS) {
      next.blockedUntil = now + BLOCK_MS;
    }
    passwordAttempts.set(clientIp, next);

    if (next.blockedUntil > now) {
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(BLOCK_MS / 1000)) } },
      );
    }
    return NextResponse.json({ error: 'Incorrect Mission IAS password.' }, { status: 401 });
  }

  passwordAttempts.delete(clientIp);

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
