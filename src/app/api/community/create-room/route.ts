import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, verifySessionCookie } from '@/lib/firebase/admin';
import { verifyRequestAuth } from '@/lib/auth/verify-request';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'ss_session';

export async function POST(request: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase admin is not configured.' }, { status: 500 });
    }

    // Prefer the session cookie; if it is missing/expired, fall back to the Firebase ID token.
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;
    let uid: string | null = null;
    let tokenName = '';
    if (session) {
      try {
        const decoded = await verifySessionCookie(session);
        uid = decoded.uid;
        tokenName = String((decoded as { name?: string }).name || '');
      } catch {
        uid = null;
      }
    }
    if (!uid) {
      const verified = await verifyRequestAuth(request as NextRequest);
      if (verified instanceof NextResponse) return verified;
      uid = verified.uid;
    }
    const userId: string = uid;

    const body = await request.json();

    const name = String(body?.name || '').trim().slice(0, 100) || 'Study Room';
    const subject = body?.subject ? String(body.subject).slice(0, 100) : null;
    const exam = body?.exam ? String(body.exam).slice(0, 100) : null;
    const state = body?.state ? String(body.state).slice(0, 100) : null;
    const displayName = String(body?.displayName || tokenName || 'Student').slice(0, 80);
    const photoURL = body?.photoURL ? String(body.photoURL).slice(0, 500) : null;

    const roomRef = adminDb.collection('studyRooms').doc();
    const memberRef = roomRef.collection('members').doc(userId);
    const profileRef = adminDb.collection('communityProfiles').doc(userId);

    const batch = adminDb.batch();

    batch.set(roomRef, {
      name,
      subject,
      exam,
      state,
      hostUid: userId,
      public: true,
      active: true,
      participantCount: 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.set(memberRef, {
      uid: userId,
      displayName,
      photoURL,
      status: 'online',
      focusStartedAt: null,
      lastSeenAt: FieldValue.serverTimestamp(),
    });

    batch.set(profileRef, {
      uid: userId,
      displayName,
      photoURL,
      state,
      exam,
      isOnline: true,
      lastSeenAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    await batch.commit();

    return NextResponse.json({ roomId: roomRef.id });
  } catch (error) {
    console.error('Create study room failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not create study room.' },
      { status: 500 }
    );
  }
}
