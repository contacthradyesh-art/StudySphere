'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Check, Plus, Target } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { createTask, toggleTask } from '@/lib/planner/task-service';
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

  async function handleToggle(task: Task) {
    if (!user) return;
    const nowCompleted = !task.completed;
    await toggleTask(user.uid, task.id, nowCompleted);
    if (nowCompleted) void awardXp(user.uid, 'completeTask');
  }

  async function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !quickTitle.trim()) return;
    setAdding(true);
    try {
      await createTask(user.uid, { title: quickTitle.trim(), subject: null, priority: 'medium', dueDate: todayIso() });
      setQuickTitle('');
      toast.success('Added to today\u2019s mission');
    } catch {
      toast.error('Could not add task');
    } finally {
      setAdding(false);
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
          <motion.button
            key={task.id}
            onClick={() => handleToggle(task)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition-colors hover:bg-white/10"
          >
            <span
              className={cn(
                'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
                task.completed ? 'border-primary bg-gradient-brand text-white' : 'border-input'
              )}
            >
              {task.completed && <Check className="h-3.5 w-3.5" />}
            </span>
            <span className={cn('truncate text-sm', task.completed && 'text-muted-foreground line-through')}>
              {task.title}
            </span>
            {task.subject && <span className="ml-auto shrink-0 text-xs text-muted-foreground">{task.subject}</span>}
          </motion.button>
        ))}
        {tasksToday.length > visible.length && (
          <p className="text-xs text-muted-foreground">+{tasksToday.length - visible.length} more</p>
        )}
      </div>

      <form onSubmit={quickAdd} className="flex gap-2">
        <Input
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Add a quick task for today..."
          className="flex-1"
        />
        <Button type="submit" variant="gradient" size="icon" disabled={adding || !quickTitle.trim()} aria-label="Add task">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <button onClick={onManageAll} className="text-xs font-medium text-primary hover:underline">
        Manage all tasks &rarr;
      </button>
    </GlowCard>
  );
}
