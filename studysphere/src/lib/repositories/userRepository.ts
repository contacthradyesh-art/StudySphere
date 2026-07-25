import { fetchDocument, createDocument, updateDocument } from "@/lib/firebase/firestore";
import { getCurrentUserId } from "@/utils/getCurrentUserId";
import type { UserProfile, TopicMastery, XpTransaction } from "@/types/user";

const USERS_COLLECTION = "users";
const MASTERY_COLLECTION = "topicMastery";
const XP_COLLECTION = "xpTransactions";

export async function getUserProfile(): Promise<UserProfile | null> {
  const userId = getCurrentUserId();
  return fetchDocument<UserProfile>(USERS_COLLECTION, userId);
}

export async function saveUserProfile(profile: Partial<UserProfile>): Promise<void> {
  const userId = getCurrentUserId();
  const existing = await getUserProfile();
  if (existing) await updateDocument(USERS_COLLECTION, userId, profile);
  else await createDocument(USERS_COLLECTION, userId, profile as UserProfile);
}

export async function updateUserStreak(streak: number): Promise<void> {
  const userId = getCurrentUserId();
  await updateDocument(USERS_COLLECTION, userId, { currentStreak: streak });
}

export async function getTopicMastery(topicId: string): Promise<TopicMastery | null> {
  const userId = getCurrentUserId();
  const docId = `${userId}_${topicId}`;
  return fetchDocument<TopicMastery>(MASTERY_COLLECTION, docId);
}

export async function saveTopicMastery(mastery: TopicMastery): Promise<void> {
  const userId = getCurrentUserId();
  const docId = `${userId}_${mastery.topicId}`;
  await createDocument(MASTERY_COLLECTION, docId, mastery);
}

export async function logXpTransaction(transaction: Omit<XpTransaction, "id" | "userId">): Promise<void> {
  const userId = getCurrentUserId();
  const id = `${userId}_${Date.now()}`;
  await createDocument(XP_COLLECTION, id, { ...transaction, userId, id } as XpTransaction);
}
