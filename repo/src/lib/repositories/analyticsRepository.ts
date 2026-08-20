import { fetchDocuments, createDocument } from "@/lib/firebase/firestore";
import { getCurrentUserId } from "@/utils/getCurrentUserId";
import { where, orderBy, limit } from "firebase/firestore";

const ANALYTICS_COLLECTION = "analyticsSnapshots";
const STUDY_LOGS_COLLECTION = "studyLogs";

export async function saveAnalyticsSnapshot(snapshot: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(ANALYTICS_COLLECTION, `${userId}_${Date.now()}`, { ...snapshot, userId });
}

export async function getLatestAnalytics() {
  const userId = getCurrentUserId();
  return fetchDocuments(ANALYTICS_COLLECTION, [where("userId", "==", userId), orderBy("createdAt", "desc"), limit(1)]);
}

export async function logStudySession(session: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(STUDY_LOGS_COLLECTION, `${userId}_${Date.now()}`, { ...session, userId });
}

export async function getStudyLogs(days: number = 14) {
  const userId = getCurrentUserId();
  const since = new Date();
  since.setDate(since.getDate() - days);
  return fetchDocuments(STUDY_LOGS_COLLECTION, [where("userId", "==", userId), where("createdAt", ">=", since), orderBy("createdAt", "desc")]);
}
