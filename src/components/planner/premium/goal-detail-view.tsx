'use client';

import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowCard } from '@/components/planner/premium/glow-card';
import { MilestoneList } from '@/components/planner/premium/milestone-list';
import { selectMilestonesForGoal } from '@/store/lifegoal-store';
import {
  createLifeMilestone, updateLifeMilestone, completeLifeMilestone,
  deleteLifeMilestone, completeLifeGoal
} from '@/lib/lifegoals/lifegoal-service';
import { useAuth } from '@/hooks/use-auth';
import type { LifeGoalProgress } from '@/hooks/use-lifegoal-insights';
import type { LifeMilestone } from '@/lib/firestore/lifegoal-schema';

export function GoalDetailView({
  data, allMilestones, onBack
}: { data: LifeGoalProgress; allMilestones: LifeMilestone[]; onBack: () => void }) {
  const { user } = useAuth();
  const { goal, progress, completedMilestones, totalMilestones } = data;
  const milestones = selectMilestonesForGoal(allMilestones, goal.id);

  async function handleAdd(title: string) {
    if (!user) return;
    await createLifeMilestone(user.uid, { lifeGoalId: goal.id, title, deadline: null });
  }

  async function handleToggle(m: LifeMilestone) {
    if (!user) return;
    if (m.status === 'completed') {
      await updateLifeMilestone(user.uid, m.id, { status: 'pending', completedAt: null });
    } else {
      await completeLifeMilestone(user.uid, m.id);
      // Auto-complete the goal if this was the last pending milestone.
      const stillPending = milestones.filter((x) => x.id !== m.id && x.status !== 'completed');
      if (stillPending.length === 0 && goal.status === 'active') {
        await completeLifeGoal(user.uid, goal.id);
      }
    }
  }

  async function handleDelete(m: LifeMilestone) {
    if (!user) return;
    await deleteLifeMilestone(user.uid, m.id);
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to goals
      </button>

      <GlowCard accent={goal.color || '#8b5cf6'} className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">{goal.title}</h2>
            {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
          </div>
          {goal.status === 'completed' && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{completedMilestones}/{totalMilestones} milestones complete · {progress}%</p>
      </GlowCard>

      <GlowCard className="space-y-3">
        <h3 className="font-semibold">Milestones</h3>
        <MilestoneList milestones={milestones} onAdd={handleAdd} onToggle={handleToggle} onDelete={handleDelete} />
      </GlowCard>
    </div>
  );
}
