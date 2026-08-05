import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { sendPush } from '@/lib/push/web-push-server';

export const maxDuration = 60;

/**
 * Called every 1-2 minutes by an external scheduler (Vercel Hobby cron only
 * allows once/day, so we use a free external scheduler like cron-job.org —
 * see README notes / setup instructions given to the user).
 *
 * For each life-goal and task whose reminderAt has passed and hasn't been
 * pushed yet, sends a Web Push notification to every device the owning user
 * has subscribed, then records it as sent so it's never pushed twice.
 */
export async function GET(req: NextRequest) {
  if (!adminDb) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const todayKey = new Date(now).toISOString().slice(0, 10); // YYYY-MM-DD
  const results = { checked: 0, sent: 0, skippedAlreadyFired: 0, noSubscriptions: 0, errors: 0 };

  async function processItem(opts: {
    type: 'goal' | 'task';
    uid: string;
    id: string;
    reminderAt: number;
    title: string;
    subtitle: string;
  }) {
    results.checked++;
    // Scoped to today's date, not just the item id — this is intentional:
    // an incomplete goal/task should keep nagging the student daily rather
    // than sending exactly one push notification for its entire lifetime.
    const firedKey = `${opts.type}:${opts.uid}:${opts.id}:${todayKey}`;
    const firedRef = adminDb!.collection('pushRemindersFired').doc(firedKey);
    const firedSnap = await firedRef.get();
    if (firedSnap.exists) {
      results.skippedAlreadyFired++;
      return;
    }

    const subsSnap = await adminDb!
      .collection('users')
      .doc(opts.uid)
      .collection('pushSubscriptions')
      .get();

    if (subsSnap.empty) {
      results.noSubscriptions++;
      // Still mark as fired — the client-side in-app alarm (if the tab is
      // open) already handles this case; don't retry forever with no target.
      await firedRef.set({ firedAt: now, reason: 'no-subscriptions' });
      return;
    }

    let anySent = false;
    for (const subDoc of subsSnap.docs) {
      const data = subDoc.data() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const outcome = await sendPush(
        { endpoint: data.endpoint, keys: data.keys },
        { title: `🔔 ${opts.title}`, body: opts.subtitle, url: '/dashboard/planner' }
      );
      if (outcome === 'ok') anySent = true;
      else if (outcome === 'expired') await subDoc.ref.delete();
      else results.errors++;
    }

    if (anySent) results.sent++;
    await firedRef.set({ firedAt: now });
  }

  // ── Life goals ──
  const goalsSnap = await adminDb
    .collectionGroup('lifeGoals')
    .where('reminderAt', '<=', now)
    .where('status', '==', 'active')
    .get();

  for (const doc of goalsSnap.docs) {
    const uid = doc.ref.parent.parent?.id;
    if (!uid) continue;
    const g = doc.data() as { title?: string; examTag?: string; reminderAt?: number };
    if (!g.reminderAt) continue;
    const overdueDays = Math.floor((now - g.reminderAt) / 86400000);
    await processItem({
      type: 'goal',
      uid,
      id: doc.id,
      reminderAt: g.reminderAt,
      title: g.title || 'Goal reminder',
      subtitle: overdueDays > 0
        ? `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''} — ${g.examTag || 'still not done'}.`
        : g.examTag || 'Time to work on this goal.'
    });
  }

  // ── Tasks ──
  const tasksSnap = await adminDb
    .collectionGroup('tasks')
    .where('reminderAt', '<=', now)
    .where('completed', '==', false)
    .get();

  for (const doc of tasksSnap.docs) {
    const uid = doc.ref.parent.parent?.id;
    if (!uid) continue;
    const t = doc.data() as { title?: string; subject?: string; reminderAt?: number };
    if (!t.reminderAt) continue;
    const overdueDays = Math.floor((now - t.reminderAt) / 86400000);
    await processItem({
      type: 'task',
      uid,
      id: doc.id,
      reminderAt: t.reminderAt,
      title: t.title || 'Task reminder',
      subtitle: overdueDays > 0
        ? `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''} — still not done.`
        : t.subject || 'Time for this task.'
    });
  }

  return NextResponse.json({ ok: true, ...results });
}
