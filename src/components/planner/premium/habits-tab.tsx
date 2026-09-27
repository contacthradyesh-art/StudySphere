'use client';

import { useState } from 'react';
import { Plus, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { HabitCard } from '@/components/planner/premium/habit-card';
import { HabitDialog } from '@/components/planner/premium/habit-create-dialog';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { useHabitInsights } from '@/hooks/use-habit-insights';
import { useHabitStore } from '@/store/habit-store';
import { createHabit, deleteHabit, newHabitId, toggleHabitLog } from '@/lib/habits/habit-service';
import type { Habit, NewHabit } from '@/lib/firestore/habit-schema';

type PendingHabit = Habit & { createdAt: null; updatedAt: null };
const todayIso = () => new Date().toISOString().slice(0, 10);

function readableError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'code' in error) return String((error as { code?: unknown }).code);
  return 'Could not save the habit. Please try again.';
}

export function HabitsTab() {
  const { user } = useAuth();
  const { loading, habitProgress } = useHabitInsights();
  const addHabit = useHabitStore((s) => s.addHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCreateHabit(data: NewHabit) {
    if (!requireAuth(user) || saving) return;

    const id = newHabitId();
    const order = habitProgress.length;
    const optimistic: PendingHabit = {
      id,
      ...data,
      status: 'active',
      order,
      createdAt: null,
      updatedAt: null
    };

    addHabit(optimistic);
    setSaving(true);
    setDialogOpen(false);
    try {
      await createHabit(user.uid, data, order, id);
      toast.success('Habit created successfully');
    } catch (error) {
      removeHabit(id);
      console.error('Habit creation failed:', error);
      toast.error('Habit save failed', { description: readableError(error) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Daily/weekly/monthly/custom habits — consistency banao, XP kamao.</p>
        <Button variant="gradient" size="sm" onClick={() => setDialogOpen(true)} disabled={saving}>
          <Plus className="h-4 w-4" /> New habit
        </Button>
      </div>

      {loading && habitProgress.length === 0 && <p className="text-sm text-muted-foreground">Loading habits…</p>}

      {!loading && habitProgress.length === 0 && (
        <GlassCard className="flex flex-col items-center gap-2 py-10 text-center">
          <Repeat className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">Koi habit nahi hai abhi</p>
          <p className="text-sm text-muted-foreground">Pehla habit banao aur streak shuru karo.</p>
        </GlassCard>
      )}

      {habitProgress.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {habitProgress.map((h) => (
            <HabitCard
              key={h.habit.id}
              data={h}
              onToggleToday={() => user && toggleHabitLog(user.uid, h.habit.id, todayIso(), !h.completedToday)}
              onDelete={() => user && deleteHabit(user.uid, h.habit.id)}
            />
          ))}
        </div>
      )}

      <HabitDialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        onSubmit={handleCreateHabit}
        saving={saving}
      />
    </div>
  );
}
