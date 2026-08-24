import { auth } from "@/lib/firebase/client";

/**
 * fetch() wrapper that attaches the signed-in user's Firebase ID token as
 * an Authorization header. Use this for any API route that calls a
 * paid/rate-limited external service (Gemini, Anthropic) — those routes
 * verify this token server-side and reject requests without it.
 */
export async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to do that.");
  const idToken = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${idToken}`);
  return fetch(url, { ...init, headers });
}
