import type { Timestamp } from 'firebase/firestore';

export type RoomPresenceStatus = 'online' | 'studying' | 'away';

export interface StudyRoom {
  id: string;
  name: string;
  subject: string | null;
  exam: string | null;
  state: string | null;
  hostUid: string;
  public: boolean;
  active: boolean;
  participantCount: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface RoomMember {
  uid: string;
  displayName: string;
  photoURL: string | null;
  status: RoomPresenceStatus;
  focusStartedAt: Timestamp | null;
  lastSeenAt: Timestamp | null;
  bio?: string;
  studyMinutes?: number;
  streak?: number;
  followersCount?: number;
  followingCount?: number;
  lastStudyDate?: string | null;
}

export interface SharedFocusSession {
  id: string;
  roomId: string;
  phase: 'focus' | 'shortBreak' | 'longBreak';
  endsAt: Timestamp;
  startedBy: string;
  subject: string | null;
  durationMinutes?: number;
  createdAt: Timestamp;
}

export interface RoomMessage {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  createdAt: Timestamp | null;
}

export interface CommunityNotification {
  id: string;
  type: 'follow' | 'roomInvite' | 'system';
  title: string;
  body: string;
  fromUid: string | null;
  roomId: string | null;
  read: boolean;
  createdAt: Timestamp | null;
}

export interface CommunityProfile {
  uid: string;
  displayName: string;
  photoURL: string | null;
  state: string | null;
  exam: string | null;
  subjects: string[];
  isOnline: boolean;
  lastSeenAt: Timestamp | null;
}