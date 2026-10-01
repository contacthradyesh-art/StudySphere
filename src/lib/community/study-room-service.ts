import {
  addDoc,
  collection,
  writeBatch,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { authedFetch } from '@/lib/auth/authed-fetch';
import type {
  StudyRoom,
  RoomMember,
  SharedFocusSession,
  CommunityProfile,
  RoomMessage,
  CommunityNotification,
} from '@/lib/firestore/community-schema';

const ROOT = 'studyRooms';
const PROFILE_ROOT = 'communityProfiles';

function roomsCol() { return collection(db, ROOT); }
function roomDoc(roomId: string) { return doc(db, ROOT, roomId); }
function membersCol(roomId: string) { return collection(db, ROOT, roomId, 'members'); }
function memberDoc(roomId: string, uid: string) { return doc(db, ROOT, roomId, 'members', uid); }
function studyRecordDoc(uid: string, sessionId: string) { return doc(db, PROFILE_ROOT, uid, 'studyRecords', sessionId); }
function focusCol(roomId: string) { return collection(db, ROOT, roomId, 'focusSessions'); }
function messagesCol(roomId: string) { return collection(db, ROOT, roomId, 'messages'); }
function reportsCol(roomId: string) { return collection(db, ROOT, roomId, 'reports'); }
function profileDoc(uid: string) { return doc(db, PROFILE_ROOT, uid); }
function followingCol(uid: string) { return collection(db, 'users', uid, 'following'); }
function notificationsCol(uid: string) { return collection(db, 'users', uid, 'notifications'); }

export function subscribeStudyRoom(roomId: string, cb: (room: StudyRoom | null) => void, onError?: (error: Error) => void) {
  return onSnapshot(roomDoc(roomId), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as StudyRoom) : null);
  }, (error) => onError?.(error instanceof Error ? error : new Error('Could not load study room.')));
}

export async function reconcileRoomParticipantCount(roomId: string) {
  const snap = await getDocs(membersCol(roomId));
  const cutoff = Date.now() - 90_000;
  const count = snap.docs.reduce((total, member) => {
    const data = member.data();
    const lastSeen = data.lastSeenAt && typeof data.lastSeenAt.toMillis === 'function' ? data.lastSeenAt.toMillis() : 0;
    return total + (data.status !== 'away' && lastSeen >= cutoff ? 1 : 0);
  }, 0);
  await setDoc(roomDoc(roomId), { participantCount: count, updatedAt: serverTimestamp() }, { merge: true });
  return count;
}

export async function createStudyRoom(input: { name: string; subject?: string | null; exam?: string | null; state?: string | null; host: CommunityProfile }): Promise<string> {
  const response = await authedFetch('/api/community/create-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      name: input.name,
      subject: input.subject ?? null,
      exam: input.exam ?? null,
      state: input.state ?? null,
      displayName: input.host.displayName || 'Student',
      photoURL: input.host.photoURL ?? null,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Could not create study room.');
  }

  return String(payload.roomId);
}
export function subscribePublicRooms(cb: (rooms: StudyRoom[]) => void, onError?: (error: Error) => void) {
  const q = query(roomsCol(), where('public', '==', true), where('active', '==', true), orderBy('updatedAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudyRoom)), (error) => onError?.(error instanceof Error ? error : new Error('Could not load rooms.')));
}

export function subscribeRoomMembers(roomId: string, cb: (members: RoomMember[]) => void) {
  const q = query(membersCol(roomId), orderBy('lastSeenAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as RoomMember)));
}

export async function joinStudyRoom(roomId: string, profile: CommunityProfile) {
  await runTransaction(db, async (tx) => {
    const roomRef = roomDoc(roomId);
    const memberRef = memberDoc(roomId, profile.uid);
    const [roomSnap, memberSnap] = await Promise.all([tx.get(roomRef), tx.get(memberRef)]);
    if (!roomSnap.exists() || roomSnap.data().active === false) throw new Error('Study room is not available');
    const removedUids = roomSnap.data().removedUids;
    if (Array.isArray(removedUids) && removedUids.includes(profile.uid)) throw new Error('You were removed from this room.');

    // Create/restore the member first. A non-host cannot update the room's
    // participantCount until this member document exists under the current rules.
    tx.set(memberRef, {
      uid: profile.uid,
      displayName: profile.displayName || 'Student',
      photoURL: profile.photoURL ?? null,
      status: 'online',
      focusStartedAt: null,
      lastSeenAt: serverTimestamp(),
    }, { merge: true });

    // participantCount is reconciled after the transaction, once membership exists.
    void memberSnap;
  });
  await reconcileRoomParticipantCount(roomId);
  const existingProfile = await getCommunityProfile(profile.uid);
  if (existingProfile) {
    await setDoc(profileDoc(profile.uid), { isOnline: true, lastSeenAt: serverTimestamp() }, { merge: true });
  } else {
    await upsertCommunityProfile({ ...profile, isOnline: true });
  }
}

export async function leaveStudyRoom(roomId: string, uid: string) {
  await runTransaction(db, async (tx) => {
    const roomRef = roomDoc(roomId);
    const memberRef = memberDoc(roomId, uid);
    const [roomSnap, memberSnap] = await Promise.all([tx.get(roomRef), tx.get(memberRef)]);
    if (!roomSnap.exists() || !memberSnap.exists()) return;
    if (memberSnap.data().status !== 'away') {
      const current = Number(roomSnap.data().participantCount || 0);
      tx.update(roomRef, { participantCount: Math.max(0, current - 1), updatedAt: serverTimestamp() });
    }
    tx.set(memberRef, { status: 'away', focusStartedAt: null, lastSeenAt: serverTimestamp() }, { merge: true });
  });
  await reconcileRoomParticipantCount(roomId);
}

export async function updateRoomPresence(roomId: string, profile: CommunityProfile, status: RoomMember['status']) {
  await setDoc(memberDoc(roomId, profile.uid), {
    uid: profile.uid,
    displayName: profile.displayName || 'Student',
    photoURL: profile.photoURL ?? null,
    status,
    focusStartedAt: status === 'studying' ? serverTimestamp() : null,
    lastSeenAt: serverTimestamp(),
  }, { merge: true });
  await setDoc(profileDoc(profile.uid), { isOnline: status !== 'away', lastSeenAt: serverTimestamp() }, { merge: true });
}

export function subscribeSharedFocus(roomId: string, cb: (sessions: SharedFocusSession[]) => void) {
  const q = query(focusCol(roomId), orderBy('createdAt', 'desc'), limit(3));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SharedFocusSession)));
}

export async function startSharedFocus(roomId: string, uid: string, minutes: number, subject: string | null = null) {
  const safeMinutes = Math.max(5, Math.min(120, Math.round(minutes)));
  const ref = await addDoc(focusCol(roomId), {
    roomId,
    phase: 'focus',
    endsAt: Timestamp.fromDate(new Date(Date.now() + safeMinutes * 60 * 1000)),
    startedBy: uid,
    subject,
    durationMinutes: safeMinutes,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function stopSharedFocus(roomId: string, uid: string) {
  await addDoc(focusCol(roomId), {
    roomId,
    phase: 'shortBreak',
    endsAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
    startedBy: uid,
    subject: null,
    durationMinutes: 5,
    createdAt: serverTimestamp(),
  });
}

export function subscribeRoomMessages(roomId: string, cb: (messages: RoomMessage[]) => void) {
  const q = query(messagesCol(roomId), orderBy('createdAt', 'asc'), limit(100));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RoomMessage)));
}

export async function sendRoomMessage(roomId: string, profile: CommunityProfile, text: string) {
  const clean = text.trim().slice(0, 500);
  if (!clean) return;
  await addDoc(messagesCol(roomId), {
    uid: profile.uid,
    displayName: profile.displayName || 'Student',
    text: clean,
    createdAt: serverTimestamp(),
  });
  await setDoc(roomDoc(roomId), { updatedAt: serverTimestamp() }, { merge: true });
}

export async function reportRoomUser(roomId: string, reporterUid: string, reportedUid: string, reason: string) {
  await addDoc(reportsCol(roomId), {
    reporterUid,
    reportedUid,
    reason: reason.trim().slice(0, 300) || 'Other',
    createdAt: serverTimestamp(),
  });
}

export async function followStudent(uid: string, targetUid: string, fromName = 'A student') {
  if (uid === targetUid) return;
  await setDoc(doc(db, 'users', uid, 'following', targetUid), {
    targetUid,
    createdAt: serverTimestamp(),
    following: true,
  });
  await addDoc(notificationsCol(targetUid), {
    type: 'follow',
    title: 'New study connection',
    body: `${fromName} connected with you.`,
    fromUid: uid,
    roomId: null,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function unfollowStudent(uid: string, targetUid: string) {
  await setDoc(doc(db, 'users', uid, 'following', targetUid), {
    targetUid,
    removedAt: serverTimestamp(),
    following: false,
  }, { merge: true });
}

export async function isFollowingStudent(uid: string, targetUid: string) {
  const snap = await getDoc(doc(db, 'users', uid, 'following', targetUid));
  return snap.exists() && snap.data().following !== false;
}

export async function findMyRooms(uid: string) {
  const q = query(roomsCol(), where('hostUid', '==', uid), orderBy('updatedAt', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudyRoom);
}

export async function getCommunityProfile(uid: string): Promise<CommunityProfile | null> {
  const snap = await getDoc(profileDoc(uid));
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as CommunityProfile) : null;
}

export async function upsertCommunityProfile(profile: CommunityProfile) {
  await setDoc(profileDoc(profile.uid), {
    uid: profile.uid,
    displayName: profile.displayName || 'Student',
    photoURL: profile.photoURL ?? null,
    state: profile.state ?? null,
    exam: profile.exam ?? null,
    subjects: profile.subjects ?? [],
    isOnline: profile.isOnline ?? true,
    lastSeenAt: serverTimestamp(),
    bio: (profile.bio || '').slice(0, 160),
    studyMinutes: Math.max(0, Number(profile.studyMinutes || 0)),
    streak: Math.max(0, Number(profile.streak || 0)),
    followersCount: Math.max(0, Number(profile.followersCount || 0)),
    followingCount: Math.max(0, Number(profile.followingCount || 0)),
    lastStudyDate: profile.lastStudyDate ?? null,
  }, { merge: true });
}

export function subscribeCommunityLeaderboard(cb: (profiles: CommunityProfile[]) => void, onError?: (error: Error) => void) {
  const q = query(collection(db, PROFILE_ROOT), orderBy('streak', 'desc'), limit(50));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as CommunityProfile);
    rows.sort((a, b) => (b.streak || 0) - (a.streak || 0) || (b.studyMinutes || 0) - (a.studyMinutes || 0));
    cb(rows);
  }, (error) => onError?.(error instanceof Error ? error : new Error('Could not load leaderboard.')));
}

export async function listFollowing(uid: string): Promise<CommunityProfile[]> {
  const snap = await getDocs(query(followingCol(uid), orderBy('createdAt', 'desc'), limit(100)));
  const active = snap.docs.filter((d) => d.data().following !== false).map((d) => d.id);
  const profiles = await Promise.all(active.map((id) => getCommunityProfile(id)));
  return profiles.filter(Boolean) as CommunityProfile[];
}

export async function getFollowingCount(uid: string) {
  const snap = await getDocs(query(followingCol(uid), limit(100)));
  return snap.docs.filter((d) => d.data().following !== false).length;
}

export function subscribeRoomReports(roomId: string, cb: (reports: Array<{ id: string; reporterUid: string; reportedUid: string; reason: string; createdAt: Timestamp | null }>) => void) {
  const q = query(reportsCol(roomId), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as { id: string; reporterUid: string; reportedUid: string; reason: string; createdAt: Timestamp | null })));
}

export async function removeRoomMember(roomId: string, uid: string) {
  await runTransaction(db, async (tx) => {
    const roomRef = roomDoc(roomId);
    const memberRef = memberDoc(roomId, uid);
    const [roomSnap, memberSnap] = await Promise.all([tx.get(roomRef), tx.get(memberRef)]);
    if (!roomSnap.exists()) throw new Error('Study room is not available.');
    const removedUids = Array.isArray(roomSnap.data().removedUids) ? roomSnap.data().removedUids as string[] : [];
    if (!memberSnap.exists() || removedUids.includes(uid)) return;
    const current = Number(roomSnap.data().participantCount || 0);
    const wasCounted = memberSnap.data().status !== 'away';
    tx.update(roomRef, {
      participantCount: wasCounted ? Math.max(0, current - 1) : current,
      removedUids: [...removedUids, uid],
      updatedAt: serverTimestamp(),
    });
    tx.set(memberRef, { status: 'away', focusStartedAt: null, lastSeenAt: serverTimestamp() }, { merge: true });
  });
}

export async function closeStudyRoom(roomId: string) {
  await setDoc(roomDoc(roomId), { active: false, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeCommunityNotifications(uid: string, cb: (items: CommunityNotification[]) => void, onError?: (error: Error) => void) {
  const q = query(notificationsCol(uid), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CommunityNotification)), (error) => onError?.(error instanceof Error ? error : new Error('Could not load notifications.')));
}

export async function markCommunityNotificationRead(uid: string, notificationId: string) {
  await setDoc(doc(db, 'users', uid, 'notifications', notificationId), { read: true }, { merge: true });
}

export async function sendRoomInvite(from: CommunityProfile, targetUid: string, roomId: string, roomName: string) {
  if (!targetUid || targetUid === from.uid) return;
  await addDoc(notificationsCol(targetUid), {
    type: 'roomInvite',
    title: 'Study room invitation',
    body: `${from.displayName || 'A student'} invited you to “${roomName}”.`,
    fromUid: from.uid,
    roomId,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function searchCommunityStudents(filters: { exam?: string; state?: string; subject?: string; text?: string }) {
  const constraints: import('firebase/firestore').QueryConstraint[] = [];
  if (filters.exam) constraints.push(where('exam', '==', filters.exam));
  if (filters.state) constraints.push(where('state', '==', filters.state));
  constraints.push(limit(100));
  const snap = await getDocs(query(collection(db, PROFILE_ROOT), ...constraints));
  const term = (filters.text || '').trim().toLowerCase();
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() }) as CommunityProfile)
    .filter((p) => !filters.subject || (p.subjects || []).includes(filters.subject))
    .filter((p) => !term || [p.displayName, p.exam, p.state, p.bio, ...(p.subjects || [])].filter(Boolean).join(' ').toLowerCase().includes(term));
}

export async function recordCommunityStudy(uid: string, minutes: number, sessionId: string) {
  const safe = Math.max(1, Math.min(180, Math.round(minutes)));
  if (!sessionId) return;
  const ref = profileDoc(uid);
  const recordRef = studyRecordDoc(uid, sessionId);
  await runTransaction(db, async (tx) => {
    const [snap, recordSnap] = await Promise.all([tx.get(ref), tx.get(recordRef)]);
    if (!snap.exists() || recordSnap.exists()) return;
    const data = snap.data();
    const now = new Date();
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    const previous = typeof data.lastStudyDate === 'string' ? data.lastStudyDate : null;
    let streak = Number(data.streak || 0);
    if (previous !== today) {
      const prevDate = previous ? new Date(`${previous}T00:00:00`) : null;
      const todayDate = new Date(`${today}T00:00:00`);
      const diff = prevDate ? Math.round((todayDate.getTime() - prevDate.getTime()) / 86400000) : 0;
      streak = diff === 1 ? streak + 1 : 1;
    }
    tx.set(recordRef, { minutes: safe, createdAt: serverTimestamp() });
    tx.set(ref, {
      studyMinutes: Number(data.studyMinutes || 0) + safe,
      streak,
      lastStudyDate: today,
      isOnline: true,
      lastSeenAt: serverTimestamp(),
    }, { merge: true });
  });
}
