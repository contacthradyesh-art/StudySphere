'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { GraduationCap, Plus } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { usePlannerStore } from '@/store/planner-store';
import { addMonthlyGoal } from '@/lib/planner/monthly-plan-service';
import { monthKey } from '@/lib/planner/date-keys';
import type { UpcomingGoal } from '@/lib/planner/monthly-plan-service';

function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export function ExamCountdown({ goals }: { goals: UpcomingGoal[] }) {
  const { user } = useAuth();
  const currentGoals = usePlannerStore((s) => s.monthlyGoals);
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [adding, setAdding] = useState(false);

  const upcoming = goals.filter((g) => !g.done && daysUntil(g.targetDate) >= 0).slice(0, 6);

  async function addExam(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !label.trim() || !date) return;
    setAdding(true);
    try {
      const targetMonth = monthKey(new Date(`${date}T00:00:00`));
      const currentMonth = monthKey();
      // Use whichever goal list already represents that month so we never
      // overwrite goals that exist in a future month we haven't loaded fresh.
      const existingForMonth = targetMonth === currentMonth
        ? currentGoals
        : goals.filter((g) => g.monthKey === targetMonth).map(({ monthKey: _mk, ...g }) => g);
      await addMonthlyGoal(user.uid, existingForMonth, { label: label.trim(), subject: null, targetDate: date }, targetMonth);
      setLabel('');
      setDate('');
      toast.success('Exam added to countdown');
    } catch {
      toast.error('Could not add exam');
    } finally {
      setAdding(false);
    }
  }

  return (
    <GlowCard delay={0.05} accent="#fbbf24" className="space-y-4">
      <SectionHeading eyebrow="Exam Countdown" title="What's ahead" action={<GraduationCap className="h-5 w-5 text-amber-300" />} />

      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming exam dates yet. Add one below.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {upcoming.map((g, i) => {
            const days = daysUntil(g.targetDate);
            const urgent = days <= 14;
            const progressPct = Math.max(4, Math.min(100, Math.round(100 - (days / 90) * 100)));
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'rounded-xl border p-3',
                  urgent ? 'border-amber-400/40 bg-amber-400/10' : 'border-white/10 bg-white/5'
                )}
              >
                <p className="truncate text-sm font-semibold">{g.label}</p>
                <p className={cn('mt-0.5 text-2xl font-bold tabular-nums', urgent ? 'text-amber-300' : 'text-foreground')}>
                  {days}d
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{g.targetDate}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      <form onSubmit={addExam} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Exam name (e.g. SSC CHSL Tier 1)" />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button type="submit" variant="gradient" size="sm" disabled={adding || !label.trim() || !date}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </form>
    </GlowCard>
  );
}
