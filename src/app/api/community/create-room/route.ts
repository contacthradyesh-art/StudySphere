import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, verifySessionCookie } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'ss_session';

export async function POST(request: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase admin is not configured.' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;
    if (!session) {
      return NextResponse.json({ error: 'You are not signed in.' }, { status: 401 });
    }

    const decoded = await verifySessionCookie(session);
    const body = await request.json();

    const name = String(body?.name || '').trim().slice(0, 100) || 'Study Room';
    const subject = body?.subject ? String(body.subject).slice(0, 100) : null;
    const exam = body?.exam ? String(body.exam).slice(0, 100) : null;
    const state = body?.state ? String(body.state).slice(0, 100) : null;
    const displayName = String(body?.displayName || decoded.name || 'Student').slice(0, 80);
    const photoURL = body?.photoURL ? String(body.photoURL).slice(0, 500) : null;

    const roomRef = adminDb.collection('studyRooms').doc();
    const memberRef = roomRef.collection('members').doc(decoded.uid);
    const profileRef = adminDb.collection('communityProfiles').doc(decoded.uid);

    const batch = adminDb.batch();

    batch.set(roomRef, {
      name,
      subject,
      exam,
      state,
      hostUid: decoded.uid,
      public: true,
      active: true,
      participantCount: 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.set(memberRef, {
      uid: decoded.uid,
      displayName,
      photoURL,
      status: 'online',
      focusStartedAt: null,
      lastSeenAt: FieldValue.serverTimestamp(),
    });

    batch.set(profileRef, {
      uid: decoded.uid,
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
