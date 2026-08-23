import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

// Top-level collections that store documents scoped by a `userId` field
// (as opposed to living under users/{uid}/... , which recursiveDelete below
// already handles). Keep this in sync with lib/repositories/*.ts.
const TOP_LEVEL_USER_COLLECTIONS = [
  'analyticsSnapshots', 'studyLogs',
  'flashcardDecks', 'flashcards', 'sm2Data',
  'journalEntries',
  'plans', 'missions',
  'syllabusProgress',
  'mockTestResults', 'testSessions',
  'moodEntries', 'focusSessions',
  'topicMastery', 'xpTransactions'
];

async function deleteQueryBatch(query: FirebaseFirestore.Query) {
  const snap = await query.get();
  if (snap.empty) return;
  const batch = adminDb!.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function POST(req: NextRequest) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const authHeader = req.headers.get('authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  try {
    // Documents scoped by a userId field on other top-level collections.
    for (const col of TOP_LEVEL_USER_COLLECTIONS) {
      await deleteQueryBatch(adminDb.collection(col).where('userId', '==', uid));
    }
    // The user's own doc tree — recursiveDelete removes it and every nested
    // subcollection (notes+versions, tasks, weeklyPlan, monthlyPlan, habits+logs,
    // lifeGoals, lifeMilestones, pomodoroSessions, focusSettings, sessions, studyStats).
    await adminDb.recursiveDelete(adminDb.collection('users').doc(uid));
    // Finally, the Auth account itself.
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Account deletion failed:', err);
    return NextResponse.json(
      { error: 'Deletion failed partway through. Contact support.' },
      { status: 500 }
    );
  }
}
