import { fetchDocuments, createDocument, updateDocument } from "@/lib/firebase/firestore";
import { getCurrentUserId } from "@/utils/getCurrentUserId";
import { where, orderBy } from "firebase/firestore";

const JOURNAL_COLLECTION = "journalEntries";

export async function getJournalEntries(resolved?: boolean) {
  const userId = getCurrentUserId();
  const constraints = [where("userId", "==", userId), orderBy("createdAt", "desc")];
  if (resolved !== undefined) constraints.push(where("resolved", "==", resolved));
  return fetchDocuments(JOURNAL_COLLECTION, constraints);
}

export async function saveJournalEntry(entry: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(JOURNAL_COLLECTION, `${userId}_${entry.id}`, { ...entry, userId });
}

export async function resolveJournalEntry(entryId: string) {
  const userId = getCurrentUserId();
  await updateDocument(JOURNAL_COLLECTION, `${userId}_${entryId}`, { resolved: true, resolvedAt: new Date() });
}
