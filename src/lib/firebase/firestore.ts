import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, serverTimestamp,
  type DocumentData, type QueryConstraint, type DocumentReference,
  type CollectionReference, type WhereFilterOp,
} from "firebase/firestore";
import { db } from "./config";

export function getDocRef(path: string, ...pathSegments: string[]): DocumentReference {
  return doc(db, path, ...pathSegments);
}

export function getCollectionRef(path: string): CollectionReference {
  return collection(db, path);
}

export async function fetchDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string
): Promise<T | null> {
  const docRef = doc(db, collectionPath, docId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as unknown as T;
}

export async function fetchDocuments<T extends DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const collectionRef = collection(db, collectionPath);
  const q = query(collectionRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as unknown as T[];
}

export async function createDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string,
  data: T
): Promise<void> {
  const docRef = doc(db, collectionPath, docId);
  await setDoc(docRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateDocument(
  collectionPath: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> {
  const docRef = doc(db, collectionPath, docId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function removeDocument(collectionPath: string, docId: string): Promise<void> {
  const docRef = doc(db, collectionPath, docId);
  await deleteDoc(docRef);
}

export function buildConstraints(options: {
  filters?: Array<{ field: string; op: WhereFilterOp; value: unknown }>;
  sortBy?: { field: string; direction: "asc" | "desc" };
  pageSize?: number;
  lastDoc?: unknown;
}): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];
  if (options.filters) {
    for (const filter of options.filters) {
      constraints.push(where(filter.field, filter.op, filter.value));
    }
  }
  if (options.sortBy) constraints.push(orderBy(options.sortBy.field, options.sortBy.direction));
  if (options.pageSize) constraints.push(limit(options.pageSize));
  if (options.lastDoc) constraints.push(startAfter(options.lastDoc));
  return constraints;
}

export { where, orderBy, limit, startAfter, serverTimestamp, query };
