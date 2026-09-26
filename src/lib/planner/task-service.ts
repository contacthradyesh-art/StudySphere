import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { PLANNER_COLLECTIONS, type NewTask, type Task } from '@/lib/firestore/planner-schema';
import { ensureStudyNotifications, schedulePersistentReminder } from '@/lib/notifications/native-reminders';

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

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash) + value.charCodeAt(i);
  return Math.abs(hash | 0);
}

function scheduleTaskReminder(taskId: string, data: Partial<Task>) {
  if (!data.reminderAt || data.reminderAt <= Date.now()) return;
  void ensureStudyNotifications().then((granted) => {
    if (!granted) return;
    schedulePersistentReminder(
      data.reminderAt!,
      `Task reminder: ${data.title ?? 'Planned task'}`,
      data.subject ? `${data.subject} · Open StudySphere to continue.` : 'Your planned task is waiting. Open StudySphere to continue.',
      hashCode(taskId)
    );
  });
}

export async function createTask(uid: string, data: NewTask) {
  const ref = await addDoc(tasksCol(uid), {
    ...data,
    completed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  scheduleTaskReminder(ref.id, data);
}



export async function updateTask(uid: string, taskId: string, patch: Partial<Task>) {
  await updateDoc(doc(tasksCol(uid), taskId), { ...patch, updatedAt: serverTimestamp() });
  if (patch.reminderAt && patch.reminderAt > Date.now()) scheduleTaskReminder(taskId, patch);
}

export async function toggleTask(uid: string, taskId: string, completed: boolean) {
  await updateTask(uid, taskId, { completed });
}

export async function deleteTask(uid: string, taskId: string) {
  await deleteDoc(doc(tasksCol(uid), taskId));
}
