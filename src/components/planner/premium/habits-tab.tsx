'use client';

import { useState } from 'react';
import { Plus, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { HabitCard } from '@/components/planner/premium/habit-card';
import { HabitDialog } from '@/components/planner/premium/habit-create-dialog';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { useHabitInsights } from '@/hooks/use-habit-insights';
import { createHabit, deleteHabit, toggleHabitLog } from '@/lib/habits/habit-service';

const todayIso = () => new Date().toISOString().slice(0, 10);

export function HabitsTab() {
  const { user } = useAuth();
  const { loading, habitProgress } = useHabitInsights();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Daily/weekly/monthly/custom habits — consistency banao, XP kamao.</p>
        <Button variant="gradient" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> New habit
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading habits...</p>}

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
        onClose={() => setDialogOpen(false)}
        onSubmit={async (data) => {
          if (!requireAuth(user)) return;
          await createHabit(user.uid, data, habitProgress.length);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
