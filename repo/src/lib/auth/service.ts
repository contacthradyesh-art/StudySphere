import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut as fbSignOut,
  type User
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';

/** Error thrown by the auth service with a user-friendly message. */
export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

/** Translate a raw Firebase auth error code into a user-friendly message. */
function mapAuthError(err: unknown): AuthError {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code)
      : 'auth/unknown';

  switch (code) {
    case 'auth/invalid-email':
      return new AuthError(code, 'That email address is not valid.');
    case 'auth/user-disabled':
      return new AuthError(code, 'This account has been disabled. Contact support.');
    case 'auth/user-not-found':
      return new AuthError(code, 'No account found with that email.');
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return new AuthError(code, 'Incorrect email or password.');
    case 'auth/email-already-in-use':
      return new AuthError(code, 'An account already exists with that email.');
    case 'auth/weak-password':
      return new AuthError(code, 'Password must be at least 6 characters.');
    case 'auth/too-many-requests':
      return new AuthError(code, 'Too many attempts. Try again later or reset your password.');
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return new AuthError(code, 'Sign-in was cancelled.');
    case 'auth/popup-blocked':
      return new AuthError(code, 'Your browser blocked the sign-in popup. Allow popups and retry.');
    case 'auth/network-request-failed':
      return new AuthError(code, 'Network error. Check your connection and try again.');
    case 'auth/email-not-verified':
      return new AuthError(
        code,
        'Please verify your email before signing in. Check your inbox for the verification link.'
      );
    case 'auth/session-failed':
      return new AuthError(code, 'Could not start your session. Please try again.');
    default:
      return new AuthError(code, 'Something went wrong. Please try again.');
  }
}

/** Create the Firestore user profile if it does not already exist. */
async function ensureUserProfile(user: User, provider: 'password' | 'google') {
  const ref = doc(db, COLLECTIONS.users, user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'Student',
    photoURL: user.photoURL ?? null,
    emailVerified: user.emailVerified,
    twoFactorEnabled: false,
    provider,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/**
 * POST the ID token to our API to set an httpOnly session cookie.
 * Throws if the session could not be established so the UI never reports a
 * false success (which would otherwise bounce the user back to /login).
 */
async function establishSession(user: User) {
  const idToken = await user.getIdToken();
  let res: Response;
  try {
    res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
  } catch {
    throw mapAuthError({ code: 'auth/session-failed' });
  }
  if (!res.ok) {
    throw mapAuthError({ code: 'auth/session-failed' });
  }
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    await ensureUserProfile(user, 'password');
    await sendEmailVerification(user);
    // Do not establish a session yet: the user must verify their email first.
    await fbSignOut(auth);
    return user;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw mapAuthError(err);
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    if (!user.emailVerified) {
      // Hard-block unverified users: sign back out and surface a clear error.
      await fbSignOut(auth);
      throw mapAuthError({ code: 'auth/email-not-verified' });
    }
    await establishSession(user);
    return user;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw mapAuthError(err);
  }
}

export async function loginWithGoogle() {
  try {
    const { user } = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(user, 'google');
    // Google accounts are already verified by the provider.
    await establishSession(user);
    return user;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw mapAuthError(err);
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    throw mapAuthError(err);
  }
}

export async function resendVerification() {
  if (auth.currentUser) await sendEmailVerification(auth.currentUser);
}

export async function signOut() {
  await fbSignOut(auth);
  await fetch('/api/auth/session', { method: 'DELETE' });
}
