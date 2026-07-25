import { fetchDocument, fetchDocuments, createDocument, updateDocument } from "@/lib/firebase/firestore";
import { getCurrentUserId } from "@/utils/getCurrentUserId";
import { where } from "firebase/firestore";

const PLANS_COLLECTION = "plans";
const MISSIONS_COLLECTION = "missions";

export async function getDailyPlan(date: string) {
  const userId = getCurrentUserId();
  return fetchDocument(PLANS_COLLECTION, `${userId}_${date}`);
}

export async function saveDailyPlan(date: string, plan: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(PLANS_COLLECTION, `${userId}_${date}`, { ...plan, userId, date });
}

export async function updateTaskStatus(date: string, taskId: string, status: string) {
  const userId = getCurrentUserId();
  await updateDocument(PLANS_COLLECTION, `${userId}_${date}`, { [`tasks.${taskId}.status`]: status });
}

export async function getMissions() {
  const userId = getCurrentUserId();
  return fetchDocuments(MISSIONS_COLLECTION, [where("userId", "==", userId)]);
}

export async function saveMission(mission: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(MISSIONS_COLLECTION, `${userId}_${mission.id}`, { ...mission, userId });
}
