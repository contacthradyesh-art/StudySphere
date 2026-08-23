import { fetchDocuments, createDocument, updateDocument } from "@/lib/firebase/firestore";
import { getCurrentUserId } from "@/utils/getCurrentUserId";
import { where, orderBy } from "firebase/firestore";
import type { JournalEntry } from "@/features/journal/types";

const COLLECTION = "mistakeEntries";

interface RawJournalDoc extends Omit<JournalEntry, "createdAt" | "resolvedAt"> {
  userId: string;
  createdAt: { toDate: () => Date } | null;
  resolvedAt?: string;
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const userId = getCurrentUserId();
  const docs = await fetchDocuments<RawJournalDoc>(COLLECTION, [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  ]);
  return docs.map((d) => ({
    ...d,
    // createDocument() always stamps createdAt with a Firestore serverTimestamp.
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
    resolvedAt: d.resolvedAt ? new Date(d.resolvedAt) : undefined,
  }));
}

export async function addJournalEntry(entry: Omit<JournalEntry, "id" | "resolved" | "resolvedAt" | "createdAt">): Promise<void> {
  const userId = getCurrentUserId();
  const id = `${userId}_${Date.now()}`;
  await createDocument(COLLECTION, id, {
    ...entry,
    id,
    userId,
    resolved: false,
  });
}

export async function resolveJournalEntry(id: string): Promise<void> {
  await updateDocument(COLLECTION, id, {
    resolved: true,
    resolvedAt: new Date().toISOString(),
  });
}
