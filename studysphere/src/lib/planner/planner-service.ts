import { getCurrentUserId } from "@/utils/getCurrentUserId";
import { getWeeklyPlan, saveWeeklyPlan } from "@/lib/planner/weekly-plan-service";
import { subscribeTasks, createTask, updateTask, toggleTask, deleteTask } from "@/lib/planner/task-service";
import { subscribeMonthlyPlan, addMonthlyGoal, toggleMonthlyGoal, removeMonthlyGoal } from "@/lib/planner/monthly-plan-service";

export function plannerService() {
  const uid = getCurrentUserId();
  return {
    uid,
    getWeeklyPlan: (key?: string) => getWeeklyPlan(uid, key),
    saveWeeklyPlan: (slots: unknown[], key?: string) => saveWeeklyPlan(uid, slots as never[], key),
    subscribeTasks: (cb: (tasks: unknown[]) => void) => subscribeTasks(uid, cb as never),
    createTask: (data: unknown) => createTask(uid, data as never),
    updateTask: (taskId: string, patch: unknown) => updateTask(uid, taskId, patch as never),
    toggleTask: (taskId: string, completed: boolean) => toggleTask(uid, taskId, completed),
    deleteTask: (taskId: string) => deleteTask(uid, taskId),
    subscribeMonthlyPlan: (cb: (goals: unknown[]) => void) => subscribeMonthlyPlan(uid, cb as never),
    addMonthlyGoal: (current: unknown[], goal: unknown) => addMonthlyGoal(uid, current as never[], goal as never),
    toggleMonthlyGoal: (current: unknown[], goalId: string, done: boolean) => toggleMonthlyGoal(uid, current as never[], goalId, done),
    removeMonthlyGoal: (current: unknown[], goalId: string) => removeMonthlyGoal(uid, current as never[], goalId),
  };
}
