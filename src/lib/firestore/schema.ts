import type { Timestamp } from 'firebase/firestore';

/**
 * Firestore data model for StudySphere (Milestone 1).
 * Collections:
 *   users/{uid}
 *   users/{uid}/sessions/{sessionId}      - device/session management
 *   users/{uid}/studyStats/{period}       - aggregated study metrics
 */

export const COLLECTIONS = {
  users: 'users',
  sessions: 'sessions',
  studyStats: 'studyStats'
} as const;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  provider: 'password' | 'google';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  current: boolean;
  lastActive: Timestamp;
  createdAt: Timestamp;
}

export interface StudyStats {
  uid: string;
  dailySeconds: number;
  weeklySeconds: number;
  monthlySeconds: number;
  streakDays: number;
  productivityScore: number; // 0-100
  pomodoroCount: number;
  goalProgress: number; // 0-100
  updatedAt: Timestamp;
}
