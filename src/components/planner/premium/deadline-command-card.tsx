'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Edit3, Flame, Plus, Target, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { Button } from '@/components/ui/button';
import { GoalDialog } from './goal-create-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useLifeGoalInsights } from '@/hooks/use-lifegoal-insights';
import { useLifeGoalStore } from '@/store/lifegoal-store';
import { completeLifeGoal, createLifeGoal, deleteLifeGoal, updateLifeGoal } from '@/lib/lifegoals/lifegoal-service';
import { requireAuth } from '@/lib/require-auth';
import type { LifeGoal, NewLifeGoal } from '@/lib/firestore/lifegoal-schema';

function daysLeft(deadline: string | null) {
  if (!deadline) return null;
  const end = new Date(deadline + 'T23:59:59').getTime();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (!Number.isFinite(end)) return null;
  return Math.ceil((end - start) / 86400000);
}

function formatDeadline(value: string | null) {
  if (!value) return 'No deadline';
  const date = new Date(value + 'T00:00:00');
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DeadlineCommandCard() {
  const { user } = useAuth();
  const { goalProgress } = useLifeGoalInsights();
  const milestones = useLifeGoalStore((s) => s.lifeMilestones);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LifeGoal | null>(null);
  const [showAll, setShowAll] = useState(false);

  const active = useMemo(
    () => goalProgress
      .filter((item) => item.goal.status === 'active' && item.goal.deadline)
      .sort((a, b) => (daysLeft(a.goal.deadline) ?? 9999) - (daysLeft(b.goal.deadline) ?? 9999)),
    [goalProgress]
  );
  const next = active[0] ?? null;

  const overall = useMemo(() => {
    if (!active.length) return 0;
    return Math.round(active.reduce((sum, item) => sum + item.progress, 0) / active.length);
  }, [active]);

  async function saveGoal(data: NewLifeGoal) {
    if (!requireAuth(user)) return;
    try {
      if (editing) {
        await updateLifeGoal(user.uid, editing.id, data);
      } else {
        await createLifeGoal(user.uid, data, goalProgress.length);
      }
    } catch (error) {
      console.error('Deadline goal save failed:', error);
      return;
    }
    setDialogOpen(false);
    setEditing(null);
  }

  async function finishGoal(goalId: string) {
    if (!requireAuth(user)) return;
    try { await completeLifeGoal(user.uid, goalId); } catch (error) { console.error('Goal completion failed:', error); }
  }

  async function removeGoal(goalId: string) {
    if (!requireAuth(user)) return;
    try { await deleteLifeGoal(user.uid, goalId); } catch (error) { console.error('Goal deletion failed:', error); }
  }

  const dLeft = next ? daysLeft(next.goal.deadline) : null;
  const urgent = dLeft !== null && dLeft <= 7;
  const milestoneCount = next ? milestones.filter((m) => m.lifeGoalId === next.goal.id).length : 0;
  const completedMilestones = next ? milestones.filter((m) => m.lifeGoalId === next.goal.id && m.status === 'completed').length : 0;

  return (
    <>
      <GlowCard accent="#ec4899" className="overflow-hidden">
        <SectionHeading
          eyebrow="Deadline Command Center"
          title="Your deadline, under control"
          action={<CalendarClock className="h-5 w-5 text-pink-300" />}
        />

        {!next ? (
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm font-semibold">30-day mission start karo</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Ek goal, ek deadline aur milestones banao. Planner + APK reminders usi deadline ke around chalega.
              </p>
            </div>
            <Button className="bg-gradient-brand" onClick={() => { setEditing(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Set deadline
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-pink-400/20 bg-pink-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-pink-300">Active deadline</span>
                  {next.goal.examTag && <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-muted-foreground">{next.goal.examTag}</span>}
                </div>
                <h3 className="mt-2 truncate text-xl font-black">{next.goal.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{formatDeadline(next.goal.deadline)} · {milestoneCount} milestones · {completedMilestones} completed</p>
              </div>
              <div className="text-left md:text-right">
                <p className={urgent ? 'text-4xl font-black text-rose-300' : 'text-4xl font-black text-primary'}>
                  {dLeft === null ? '—' : dLeft < 0 ? Math.abs(dLeft) : dLeft}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{dLeft !== null && dLeft < 0 ? 'days overdue' : 'days left'}</p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold">Milestone progress</span>
                <span className="text-muted-foreground">{next.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all" style={{ width: next.progress + '%' }} />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => { setEditing(next.goal); setDialogOpen(true); }} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs font-semibold hover:bg-white/[0.06]">
                <Edit3 className="h-4 w-4" /> Edit deadline
              </button>
              <button type="button" onClick={() => void finishGoal(next.goal.id)} disabled={next.goal.status === 'completed'} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5 text-xs font-semibold text-emerald-300 disabled:opacity-50">
                <CheckCircle2 className="h-4 w-4" /> Mark complete
              </button>
              <button type="button" onClick={() => void removeGoal(next.goal.id)} className="flex items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-400/15">
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Mini label="Overall" value={overall + '%'} />
              <Mini label="Days left" value={dLeft === null ? '—' : String(Math.max(0, dLeft))} />
              <Mini label="Milestones" value={completedMilestones + '/' + milestoneCount} />
              <Mini label="State" value={urgent ? 'Final push' : 'On track'} icon={urgent ? <Flame className="h-3.5 w-3.5 text-rose-300" /> : <Target className="h-3.5 w-3.5 text-primary" />} />
            </div>


            {active.length > 1 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <button type="button" onClick={() => setShowAll((value) => !value)} className="flex w-full items-center justify-between text-left text-xs font-semibold">
                  <span>All active deadlines ({active.length})</span>
                  {showAll ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {showAll && <div className="mt-3 space-y-2">{active.slice(1).map((item) => <button type="button" key={item.goal.id} onClick={() => { setEditing(item.goal); setDialogOpen(true); }} className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left hover:bg-white/[0.05]"><span className="min-w-0 truncate text-xs font-medium">{item.goal.title}</span><span className="ml-3 shrink-0 text-[10px] text-muted-foreground">{daysLeft(item.goal.deadline) ?? '—'}d</span></button>)}</div>}
              </div>
            )}          </div>
        )}
      </GlowCard>

      <GoalDialog
        open={dialogOpen}
        initial={editing}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={saveGoal}
      />
    </>
  );
}

function Mini({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{icon}{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
