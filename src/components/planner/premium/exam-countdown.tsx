'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { GraduationCap, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { usePlannerStore } from '@/store/planner-store';
import { addMonthlyGoal, updateMonthlyGoal, removeMonthlyGoal } from '@/lib/planner/monthly-plan-service';
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDate, setEditDate] = useState('');

  const upcoming = goals.filter((g) => !g.done && daysUntil(g.targetDate) >= 0).slice(0, 6);

  function goalsListFor(targetMonth: string) {
    const currentMonth = monthKey();
    return targetMonth === currentMonth
      ? currentGoals
      : goals.filter((g) => g.monthKey === targetMonth).map(({ monthKey: _mk, ...g }) => g);
  }

  async function addExam(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !date) return;
    if (!requireAuth(user)) return;
    setAdding(true);
    try {
      const targetMonth = monthKey(new Date(`${date}T00:00:00`));
      await addMonthlyGoal(user.uid, goalsListFor(targetMonth), { label: label.trim(), subject: null, targetDate: date }, targetMonth);
      setLabel('');
      setDate('');
      toast.success('Exam added to countdown');
    } catch {
      toast.error('Could not add exam');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(g: UpcomingGoal) {
    setEditingId(g.id);
    setEditLabel(g.label);
    setEditDate(g.targetDate);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLabel('');
    setEditDate('');
  }

  async function saveEdit(g: UpcomingGoal) {
    if (!requireAuth(user)) return;
    const trimmed = editLabel.trim();
    if (!trimmed || !editDate) { cancelEdit(); return; }
    try {
      await updateMonthlyGoal(user.uid, goalsListFor(g.monthKey), g.id, { label: trimmed, targetDate: editDate }, g.monthKey);
      toast.success('Exam updated');
    } catch {
      toast.error('Could not update exam');
    } finally {
      cancelEdit();
    }
  }

  async function handleDelete(g: UpcomingGoal) {
    if (!requireAuth(user)) return;
    try {
      await removeMonthlyGoal(user.uid, goalsListFor(g.monthKey), g.id, g.monthKey);
      toast.success('Exam removed');
    } catch {
      toast.error('Could not remove exam');
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
            const isEditing = editingId === g.id;
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
                {isEditing ? (
                  <div className="space-y-2">
                    <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="h-8 text-sm" autoFocus />
                    <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="h-8 text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(g)} className="text-primary hover:opacity-80" aria-label="Save"><Check className="h-4 w-4" /></button>
                      <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground" aria-label="Cancel"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{g.label}</p>
                      <div className="flex shrink-0 gap-1.5">
                        <button onClick={() => startEdit(g)} className="text-muted-foreground hover:text-primary" aria-label="Edit exam"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(g)} className="text-muted-foreground hover:text-red-500" aria-label="Delete exam"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <p className={cn('mt-0.5 text-2xl font-bold tabular-nums', urgent ? 'text-amber-300' : 'text-foreground')}>
                      {days}d
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${progressPct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{g.targetDate}</p>
                  </>
                )}
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