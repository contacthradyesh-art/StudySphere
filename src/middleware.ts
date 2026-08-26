import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'ss_session';
const MISSION_IAS_COOKIE = 'mission_ias_access';
const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

function base64Url(bytes: ArrayBuffer) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function missionIasTokenIsValid(token: string | undefined) {
  const password = process.env.MISSION_IAS_ACCESS_PASSWORD;
  if (!token || !password) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || expires <= Math.floor(Date.now() / 1000)) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expected = base64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
  return signature === expected;
}

/**
 * Protects the normal dashboard session and adds a second server-checked
 * password gate for the entire Mission IAS route tree.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (pathname.startsWith('/dashboard') && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/dashboard/mission-ias')) {
    const unlocked = await missionIasTokenIsValid(request.cookies.get(MISSION_IAS_COOKIE)?.value);
    if (!unlocked) {
      const url = request.nextUrl.clone();
      url.pathname = '/mission-ias-lock';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isAuthPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/forgot-password']
};
