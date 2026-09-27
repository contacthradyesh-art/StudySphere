'use client';

import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { GoalCard } from '@/components/planner/premium/goal-card';
import { GoalDialog } from '@/components/planner/premium/goal-create-dialog';
import { GoalDetailView } from '@/components/planner/premium/goal-detail-view';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { useLifeGoalInsights } from '@/hooks/use-lifegoal-insights';
import { useLifeGoalStore } from '@/store/lifegoal-store';
import { createLifeGoal, deleteLifeGoal, newLifeGoalId } from '@/lib/lifegoals/lifegoal-service';
import type { LifeGoal, NewLifeGoal } from '@/lib/firestore/lifegoal-schema';

type PendingGoal = LifeGoal & { createdAt: null; updatedAt: null; completedAt: null };

export function GoalsTab() {
  const { user } = useAuth();
  const { loading, goalProgress } = useLifeGoalInsights();
  const allMilestones = useLifeGoalStore((s) => s.lifeMilestones);
  const addLifeGoal = useLifeGoalStore((s) => s.addLifeGoal);
  const removeLifeGoal = useLifeGoalStore((s) => s.removeLifeGoal);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openGoalId, setOpenGoalId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const activeGoals = goalProgress.filter((g) => g.goal.status !== 'archived');
  const opened = activeGoals.find((g) => g.goal.id === openGoalId);

  if (opened) {
    return <GoalDetailView data={opened} allMilestones={allMilestones} onBack={() => setOpenGoalId(null)} />;
  }

  async function handleCreateGoal(data: NewLifeGoal) {
    if (!requireAuth(user) || saving) return;
    const id = newLifeGoalId();
    const order = activeGoals.length;
    const optimistic: PendingGoal = {
      id,
      ...data,
      status: 'active',
      order,
      createdAt: null,
      updatedAt: null,
      completedAt: null
    };
    addLifeGoal(optimistic);
    setSaving(true);
    setDialogOpen(false);
    try {
      await createLifeGoal(user.uid, data, order, id);
    } catch (error) {
      removeLifeGoal(id);
      console.error('Goal creation failed:', error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Dream → Goal → Milestone → Task. Apne bade goals yahan track karo.</p>
        <Button variant="gradient" size="sm" onClick={() => setDialogOpen(true)} disabled={saving}>
          <Plus className="h-4 w-4" /> New goal
        </Button>
      </div>

      {loading && activeGoals.length === 0 && <p className="text-sm text-muted-foreground">Loading goals…</p>}

      {!loading && activeGoals.length === 0 && (
        <GlassCard className="flex flex-col items-center gap-2 py-10 text-center">
          <Target className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">Koi life goal nahi hai abhi</p>
          <p className="text-sm text-muted-foreground">Pehla goal banao aur usko milestones mein todo.</p>
        </GlassCard>
      )}

      {activeGoals.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeGoals.map((g) => (
            <GoalCard
              key={g.goal.id}
              data={g}
              onOpen={() => setOpenGoalId(g.goal.id)}
              onDelete={() => { if (user) { removeLifeGoal(g.goal.id); void deleteLifeGoal(user.uid, g.goal.id); } }}
            />
          ))}
        </div>
      )}

      <GoalDialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        onSubmit={handleCreateGoal}
      />
    </div>
  );
}
