import { NextResponse } from 'next/server';

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, Bucket>;

const globalStore = globalThis as typeof globalThis & {
  __studySphereRateLimitStore?: RateLimitStore;
};

const store: RateLimitStore =
  globalStore.__studySphereRateLimitStore ?? new Map<string, Bucket>();

globalStore.__studySphereRateLimitStore = store;

export function enforceUserRateLimit(
  userId: string,
  routeKey: string,
  maxRequests = 10,
  windowMs = 60_000,
): NextResponse | null {
  const now = Date.now();
  const key = `${routeKey}:${userId}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      },
    );
  }

  current.count += 1;
  return null;
}
