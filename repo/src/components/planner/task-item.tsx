'use client';

import { Check, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from './priority-badge';
import type { Task } from '@/lib/firestore/planner-schema';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/** Single task row with complete / edit / delete actions. */
export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex items-center gap-3 rounded-xl p-3"
    >
      <button
        onClick={() => onToggle(task)}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        className={cn(
          'grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors',
          task.completed ? 'border-primary bg-gradient-brand text-white' : 'border-input'
        )}
      >
        {task.completed && <Check className="h-4 w-4" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', task.completed && 'text-muted-foreground line-through')}>
          {task.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {task.subject && <span>{task.subject}</span>}
          <span>&middot;</span>
          <span>{task.dueDate}</span>
        </div>
      </div>

      <PriorityBadge priority={task.priority} />
      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => onEdit(task)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => onDelete(task)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
