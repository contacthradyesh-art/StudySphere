import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function initAdmin(): App | null {
  const existing = getApps();
  if (existing.length) return existing[0];
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (!serviceAccount.project_id) {
      return null;
    }
    return initializeApp({
      credential: cert(serviceAccount)
    });
  } catch {
    return null;
  }
}

export const adminApp = initAdmin();
export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

export async function createSessionCookie(idToken: string) {
  if (!adminAuth) throw new Error('Firebase admin not initialized');
  return adminAuth.createSessionCookie(idToken, { expiresIn: FIVE_DAYS_MS });
}

export async function verifySessionCookie(cookie: string) {
  if (!adminAuth) throw new Error('Firebase admin not initialized');
  return adminAuth.verifySessionCookie(cookie, true);
}