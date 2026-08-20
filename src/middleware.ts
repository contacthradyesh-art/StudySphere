import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'ss_session';
const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

/**
 * Edge middleware guarding protected routes.
 * Note: cryptographic verification of the cookie happens server-side in
 * layouts/API (Node runtime). Here we do a fast presence check to redirect.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (pathname.startsWith('/dashboard') && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
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
