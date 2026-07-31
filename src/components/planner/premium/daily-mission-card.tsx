'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Check, Plus, Target, Pencil, Trash2, X, Bell } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { createTask, toggleTask, updateTask, deleteTask } from '@/lib/planner/task-service';
import { awardXp } from '@/lib/gamification/xp-service';
import type { Task } from '@/lib/firestore/planner-schema';
import type { usePlannerInsights } from '@/hooks/use-planner-insights';

type Insights = ReturnType<typeof usePlannerInsights>;

const todayIso = () => new Date().toISOString().slice(0, 10);

export function DailyMissionCard({ insights, onManageAll }: { insights: Insights; onManageAll: () => void }) {
  const { user } = useAuth();
  const { tasksToday, missionPct } = insights;
  const [quickTitle, setQuickTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showReminder, setShowReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('');

  async function handleToggle(task: Task) {
    if (!requireAuth(user)) return;
    const nowCompleted = !task.completed;
    await toggleTask(user.uid, task.id, nowCompleted);
    if (nowCompleted) void awardXp(user.uid, 'completeTask');
  }

  async function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    if (!requireAuth(user)) return;
    setAdding(true);
    try {
      let reminderAt: number | null = null;
      if (showReminder && reminderTime) {
        const combined = new Date(`${todayIso()}T${reminderTime}:00`);
        if (!isNaN(combined.getTime())) {
          // If the chosen time already passed today, assume tomorrow.
          reminderAt = combined.getTime() < Date.now() ? combined.getTime() + 24 * 60 * 60 * 1000 : combined.getTime();
        }
      }
      await createTask(user.uid, {
        title: quickTitle.trim(),
        subject: null,
        priority: 'medium',
        dueDate: todayIso(),
        ...(reminderAt ? { reminderAt } : {})
      });
      setQuickTitle('');
      setReminderTime('');
      setShowReminder(false);
      toast.success(reminderAt ? 'Added with a reminder alarm 🔔' : 'Added to today\u2019s mission');
    } catch {
      toast.error('Could not add task');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditValue(task.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  async function saveEdit(task: Task) {
    if (!requireAuth(user)) return;
    const trimmed = editValue.trim();
    if (!trimmed) { cancelEdit(); return; }
    if (trimmed !== task.title) {
      try {
        await updateTask(user.uid, task.id, { title: trimmed });
        toast.success('Task updated');
      } catch {
        toast.error('Could not update task');
      }
    }
    cancelEdit();
  }

  async function handleDelete(task: Task) {
    if (!requireAuth(user)) return;
    try {
      await deleteTask(user.uid, task.id);
      toast.success('Task deleted');
    } catch {
      toast.error('Could not delete task');
    }
  }

  const visible = tasksToday.slice(0, 6);

  return (
    <GlowCard delay={0.05} accent="#8b5cf6" className="space-y-4">
      <SectionHeading
        eyebrow="Today's Mission"
        title={tasksToday.length === 0 ? 'A clear day — set a goal' : `${missionPct}% complete`}
        action={<Target className="h-5 w-5 text-primary" />}
      />

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-gradient-brand"
          initial={{ width: 0 }}
          animate={{ width: `${missionPct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      <div className="space-y-2">
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks due today yet. Add one below to start your mission.</p>
        )}
        {visible.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <button
              onClick={() => handleToggle(task)}
              className={cn(
                'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
                task.completed ? 'border-primary bg-gradient-brand text-white' : 'border-input'
              )}
              aria-label="Toggle complete"
            >
              {task.completed && <Check className="h-3.5 w-3.5" />}
            </button>

            {editingId === task.id ? (
              <>
                <Input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(task);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  className="h-8 flex-1 text-sm"
                />
                <button onClick={() => saveEdit(task)} className="shrink-0 text-primary hover:opacity-80" aria-label="Save">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={cancelEdit} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Cancel">
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <span
                  onClick={() => startEdit(task)}
                  className={cn('flex-1 cursor-text truncate text-sm', task.completed && 'text-muted-foreground line-through')}
                >
                  {task.title}
                </span>
                {task.reminderAt && <Bell className="h-3.5 w-3.5 shrink-0 text-primary" />}
                {task.subject && <span className="shrink-0 text-xs text-muted-foreground">{task.subject}</span>}
                <button onClick={() => startEdit(task)} className="shrink-0 text-muted-foreground hover:text-primary" aria-label="Edit task">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(task)} className="shrink-0 text-muted-foreground hover:text-red-500" aria-label="Delete task">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </motion.div>
        ))}
        {tasksToday.length > visible.length && (
          <p className="text-xs text-muted-foreground">+{tasksToday.length - visible.length} more</p>
        )}
      </div>

      <form onSubmit={quickAdd} className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Add a quick task for today..."
            className="flex-1"
          />
          <Button
            type="button"
            variant={showReminder ? 'gradient' : 'outline'}
            size="icon"
            onClick={() => setShowReminder((v) => !v)}
            aria-label="Toggle reminder alarm"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button type="submit" variant="gradient" size="icon" disabled={adding || !quickTitle.trim() || !user} aria-label="Add task">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {showReminder && (
          <div className="flex items-center gap-2">
            <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full min-w-0" />
            <span className="shrink-0 text-xs text-muted-foreground">Alarm today</span>
          </div>
        )}
      </form>

      <button onClick={onManageAll} className="text-xs font-medium text-primary hover:underline">
        Manage all tasks &rarr;
      </button>
    </GlowCard>
  );
}