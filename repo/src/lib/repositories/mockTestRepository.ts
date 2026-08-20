import { fetchDocument, fetchDocuments, createDocument } from "@/lib/firebase/firestore";
import { getCurrentUserId } from "@/utils/getCurrentUserId";
import { MOCK_TEST_COLLECTIONS } from "@/lib/firestore/mock-test-schema";
import { where, orderBy, type QueryConstraint } from "firebase/firestore";

// Use the same collection names defined in mock-test-schema.ts so results
// written here are actually visible to anything reading via that schema.
const RESULTS_COLLECTION = MOCK_TEST_COLLECTIONS.results;
const SESSIONS_COLLECTION = "testSessions";

export async function saveTestResult(result: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(RESULTS_COLLECTION, `${userId}_${result.id}`, { ...result, userId });
}

export async function getTestResults(examId?: string) {
  const userId = getCurrentUserId();
  const constraints: QueryConstraint[] = [where("userId", "==", userId)];
  if (examId) constraints.push(where("examId", "==", examId));
  constraints.push(orderBy("completedAt", "desc"));
  return fetchDocuments(RESULTS_COLLECTION, constraints);
}

export async function getTestResult(resultId: string) {
  const userId = getCurrentUserId();
  return fetchDocument(RESULTS_COLLECTION, `${userId}_${resultId}`);
}

export async function saveTestSession(session: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(SESSIONS_COLLECTION, `${userId}_${session.id}`, { ...session, userId });
}
