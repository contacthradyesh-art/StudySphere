import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { PLANNER_COLLECTIONS, type NewTask, type Task } from '@/lib/firestore/planner-schema';

function tasksCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, PLANNER_COLLECTIONS.tasks);
}

/** Live-subscribe to a user's tasks, ordered by due date. */
export function subscribeTasks(uid: string, cb: (tasks: Task[]) => void) {
  const q = query(tasksCol(uid), orderBy('dueDate', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Task));
  });
}

export async function createTask(uid: string, data: NewTask) {
  await addDoc(tasksCol(uid), {
    ...data,
    completed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateTask(uid: string, taskId: string, patch: Partial<Task>) {
  await updateDoc(doc(tasksCol(uid), taskId), { ...patch, updatedAt: serverTimestamp() });
}

export async function toggleTask(uid: string, taskId: string, completed: boolean) {
  await updateTask(uid, taskId, { completed });
}

export async function deleteTask(uid: string, taskId: string) {
  await deleteDoc(doc(tasksCol(uid), taskId));
}
