import { fetchDocuments, createDocument } from "@/lib/firebase/firestore";
import { getCurrentUserId } from "@/utils/getCurrentUserId";
import { where, orderBy } from "firebase/firestore";

const MOOD_COLLECTION = "moodEntries";
const FOCUS_COLLECTION = "focusSessions";

export async function saveMoodEntry(entry: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(MOOD_COLLECTION, `${userId}_${entry.date}_${entry.time}`, { ...entry, userId });
}

export async function getMoodHistory(days: number = 7) {
  const userId = getCurrentUserId();
  const since = new Date();
  since.setDate(since.getDate() - days);
  return fetchDocuments(MOOD_COLLECTION, [where("userId", "==", userId), where("createdAt", ">=", since), orderBy("createdAt", "desc")]);
}

export async function saveFocusSession(session: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(FOCUS_COLLECTION, `${userId}_${Date.now()}`, { ...session, userId });
}

export async function getFocusSessions(days: number = 7) {
  const userId = getCurrentUserId();
  const since = new Date();
  since.setDate(since.getDate() - days);
  return fetchDocuments(FOCUS_COLLECTION, [where("userId", "==", userId), where("createdAt", ">=", since), orderBy("createdAt", "desc")]);
}
