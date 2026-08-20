import {
  collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, deleteDoc, addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { MOCK_TEST_COLLECTIONS, type CustomMockTest, type StoredTestResult } from '@/lib/firestore/mock-test-schema';
import type { Question, MockTestMode, TestResult } from '@/features/mock-tests/types';

function testsCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, MOCK_TEST_COLLECTIONS.customTests);
}
function resultsCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, MOCK_TEST_COLLECTIONS.results);
}

/** Live-subscribe to this user's custom (AI-generated + manually uploaded) tests. */
export function subscribeCustomTests(uid: string, cb: (tests: CustomMockTest[]) => void) {
  const q = query(testsCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CustomMockTest));
  });
}

/** Save a new custom test (used by both AI-generated and manually-uploaded flows). */
export async function createCustomTest(
  uid: string,
  data: {
    title: string;
    examId: string;
    examName: string;
    mode: MockTestMode;
    difficulty: 'easy' | 'medium' | 'hard';
    source: 'ai' | 'manual';
    topics: string[];
    questions: Question[];
  }
) {
  await addDoc(testsCol(uid), { ...data, createdAt: serverTimestamp() });
}

/** Delete a custom test. */
export async function deleteCustomTest(uid: string, testId: string) {
  await deleteDoc(doc(db, COLLECTIONS.users, uid, MOCK_TEST_COLLECTIONS.customTests, testId));
}

/** Save a completed test's result to history. */
export async function saveTestResult(uid: string, testTitle: string, result: TestResult) {
  await setDoc(
    doc(db, COLLECTIONS.users, uid, MOCK_TEST_COLLECTIONS.results, result.id),
    { ...result, testTitle, completedAt: serverTimestamp() }
  );
}

/** Live-subscribe to this user's test result history. */
export function subscribeTestResults(uid: string, cb: (results: StoredTestResult[]) => void) {
  const q = query(resultsCol(uid), orderBy('completedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as StoredTestResult));
  });
}