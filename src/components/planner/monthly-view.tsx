'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CalendarDays, Trash2, Plus } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { usePlannerStore } from '@/store/planner-store';
import { addMonthlyGoal, removeMonthlyGoal, toggleMonthlyGoal } from '@/lib/planner/monthly-plan-service';
import { SUBJECTS, type Subject } from '@/lib/firestore/planner-schema';
import { cn } from '@/lib/utils';

const todayIso = () => new Date().toISOString().slice(0, 10);

function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

/** Monthly plan view: list exam dates / long-term goals and add new ones. */
export function MonthlyView() {
  const { user } = useAuth();
  const goals = usePlannerStore((s) => s.monthlyGoals);
  const loading = usePlannerStore((s) => s.monthlyLoading);

  const [label, setLabel] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');
  const [targetDate, setTargetDate] = useState(todayIso());

  const sorted = [...goals].sort((a, b) => a.targetDate.localeCompare(b.targetDate));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !label.trim()) return;
    try {
      await addMonthlyGoal(user.uid, goals, {
        label: label.trim(),
        subject: (subject || null) as Subject | null,
        targetDate
      });
      setLabel('');
      setSubject('');
      setTargetDate(todayIso());
      toast.success('Goal added');
    } catch {
      toast.error('Could not add goal');
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard className="space-y-3">
        <h2 className="font-semibold">Add exam date or goal</h2>
        <form onSubmit={add} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="goal-label">Label</Label>
            <Input id="goal-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Physics midterm" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="goal-subject">Subject</Label>
            <select
              id="goal-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm"
            >
              <option value="">None</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="goal-date">Date</Label>
            <Input id="goal-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
          <div className="sm:col-span-4">
            <Button type="submit" variant="gradient" size="sm" disabled={!label.trim()}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </form>
      </GlassCard>

      {loading && <p className="text-sm text-muted-foreground">Loading monthly plan...</p>}
      {!loading && sorted.length === 0 && (
        <GlassCard><p className="text-sm text-muted-foreground">No exam dates or goals yet this month.</p></GlassCard>
      )}

      {sorted.length > 0 && (
        <GlassCard className="space-y-2">
          <h2 className="mb-1 flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4" /> This month</h2>
          <ul className="space-y-2">
            {sorted.map((g) => {
              const days = daysUntil(g.targetDate);
              const overdue = days < 0;
              return (
                <li key={g.id} className="flex items-center justify-between gap-3 rounded-lg border border-input/60 px-3 py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={g.done}
                      onChange={(e) => user && toggleMonthlyGoal(user.uid, goals, g.id, e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <div>
                      <p className={cn('font-medium', g.done && 'text-muted-foreground line-through')}>
                        {g.label}
                        {g.subject && <span className="ml-2 text-xs text-muted-foreground">{g.subject}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {g.targetDate}
                        {!g.done && (
                          <span className={cn('ml-2', overdue ? 'text-red-500' : 'text-primary')}>
                            {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'today' : `in ${days}d`}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => user && removeMonthlyGoal(user.uid, goals, g.id)}
                    className="text-muted-foreground hover:text-red-500"
                    aria-label="Remove goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
