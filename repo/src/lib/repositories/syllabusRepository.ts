import { fetchDocuments, createDocument, updateDocument } from "@/lib/firebase/firestore";
import { getCurrentUserId } from "@/utils/getCurrentUserId";
import { where } from "firebase/firestore";

const SYLLABUS_COLLECTION = "syllabusProgress";

export async function getSyllabusProgress(examId?: string) {
  const userId = getCurrentUserId();
  const constraints = [where("userId", "==", userId)];
  if (examId) constraints.push(where("examId", "==", examId));
  return fetchDocuments(SYLLABUS_COLLECTION, constraints);
}

export async function updateTopicMastery(topicId: string, mastery: string, accuracy: number) {
  const userId = getCurrentUserId();
  await updateDocument(SYLLABUS_COLLECTION, `${userId}_${topicId}`, { mastery, accuracy });
}

export async function saveTopicProgress(progress: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(SYLLABUS_COLLECTION, `${userId}_${progress.topicId}`, { ...progress, userId });
}
