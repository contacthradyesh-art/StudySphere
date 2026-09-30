import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { StudyRoom, RoomMember, SharedFocusSession, CommunityProfile } from '@/lib/firestore/community-schema';

const ROOT = 'studyRooms';

function roomsCol() { return collection(db, ROOT); }
function roomDoc(roomId: string) { return doc(db, ROOT, roomId); }
function membersCol(roomId: string) { return collection(db, ROOT, roomId, 'members'); }
function memberDoc(roomId: string, uid: string) { return doc(db, ROOT, roomId, 'members', uid); }
function focusCol(roomId: string) { return collection(db, ROOT, roomId, 'focusSessions'); }

export async function createStudyRoom(input: { name: string; subject?: string | null; host: CommunityProfile }): Promise<string> {
  const ref = await addDoc(roomsCol(), {
    name: input.name.trim() || 'Study Room',
    subject: input.subject ?? null,
    hostUid: input.host.uid,
    public: true,
    active: true,
    participantCount: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  await setDoc(memberDoc(ref.id, input.host.uid), {
    uid: input.host.uid,
    displayName: input.host.displayName || 'Student',
    photoURL: input.host.photoURL ?? null,
    status: 'online',
    focusStartedAt: null,
    lastSeenAt: serverTimestamp()
  });
  return ref.id;
}

export function subscribePublicRooms(cb: (rooms: StudyRoom[]) => void) {
  const q = query(roomsCol(), where('public', '==', true), where('active', '==', true), orderBy('updatedAt', 'desc'), limit(30));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudyRoom)));
}

export function subscribeRoomMembers(roomId: string, cb: (members: RoomMember[]) => void) {
  const q = query(membersCol(roomId), orderBy('lastSeenAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as RoomMember)));
}

export async function joinStudyRoom(roomId: string, profile: CommunityProfile) {
  await setDoc(memberDoc(roomId, profile.uid), {
    uid: profile.uid,
    displayName: profile.displayName || 'Student',
    photoURL: profile.photoURL ?? null,
    status: 'online',
    focusStartedAt: null,
    lastSeenAt: serverTimestamp()
  }, { merge: true });
  await setDoc(roomDoc(roomId), { updatedAt: serverTimestamp() }, { merge: true });
}

export async function leaveStudyRoom(roomId: string, uid: string) {
  await setDoc(memberDoc(roomId, uid), { status: 'away', lastSeenAt: serverTimestamp() }, { merge: true });
}

export async function updateRoomPresence(roomId: string, profile: CommunityProfile, status: RoomMember['status']) {
  await setDoc(memberDoc(roomId, profile.uid), {
    uid: profile.uid,
    displayName: profile.displayName || 'Student',
    photoURL: profile.photoURL ?? null,
    status,
    focusStartedAt: status === 'studying' ? serverTimestamp() : null,
    lastSeenAt: serverTimestamp()
  }, { merge: true });
}

export function subscribeSharedFocus(roomId: string, cb: (sessions: SharedFocusSession[]) => void) {
  const q = query(focusCol(roomId), orderBy('createdAt', 'desc'), limit(3));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SharedFocusSession)));
}

export async function startSharedFocus(roomId: string, uid: string, minutes: number, subject: string | null = null) {
  const endsAt = new Date(Date.now() + minutes * 60 * 1000);
  await addDoc(focusCol(roomId), {
    roomId,
    phase: 'focus',
    endsAt,
    startedBy: uid,
    subject,
    createdAt: serverTimestamp()
  });
}

export async function stopSharedFocus(roomId: string, uid: string) {
  await addDoc(focusCol(roomId), {
    roomId,
    phase: 'shortBreak',
    endsAt: new Date(Date.now() + 5 * 60 * 1000),
    startedBy: uid,
    subject: null,
    createdAt: serverTimestamp()
  });
}

export async function findMyRooms(uid: string) {
  const q = query(roomsCol(), where('hostUid', '==', uid), orderBy('updatedAt', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudyRoom);
}