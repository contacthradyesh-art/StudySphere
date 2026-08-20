import { cn } from '@/lib/utils';
import type { Priority } from '@/lib/firestore/planner-schema';

const STYLES: Record<Priority, string> = {
  low: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  high: 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
};

/** Small colored pill conveying task priority. */
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize', STYLES[priority])}>
      {priority}
    </span>
  );
}
