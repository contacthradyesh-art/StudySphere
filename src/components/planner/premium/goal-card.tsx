'use client';

import { Target, Trash2, ChevronRight } from 'lucide-react';
import { GlowCard } from '@/components/planner/premium/glow-card';
import type { LifeGoalProgress } from '@/hooks/use-lifegoal-insights';

export function GoalCard({
  data, onOpen, onDelete
}: { data: LifeGoalProgress; onOpen: () => void; onDelete: () => void }) {
  const { goal, totalMilestones, completedMilestones, progress } = data;

  return (
    <GlowCard accent={goal.color || '#8b5cf6'} className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <button onClick={onOpen} className="flex items-center gap-2 text-left">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white"
            style={{ background: `linear-gradient(135deg, ${goal.color || '#8b5cf6'}, #ec4899)` }}
          >
            <Target className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold leading-tight">{goal.title}</p>
            {goal.examTag && <p className="text-xs text-muted-foreground">{goal.examTag}</p>}
          </div>
        </button>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-brand transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{completedMilestones}/{totalMilestones} milestones</span>
          <span className="font-semibold text-foreground">{progress}%</span>
        </div>
      </div>

      <button onClick={onOpen} className="flex items-center gap-1 text-xs font-medium text-primary">
        View milestones <ChevronRight className="h-3 w-3" />
      </button>
    </GlowCard>
  );
}
