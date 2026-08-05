'use client';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { TaskItem } from '@/components/planner/task-item';
import { TaskDialog } from '@/components/planner/task-dialog';
import { WeeklyGrid } from '@/components/planner/weekly-grid';
import { MonthlyView } from '@/components/planner/monthly-view';
import { useTasksSync } from '@/hooks/use-tasks';
import { usePlannerPlansSync, useUpcomingGoals } from '@/hooks/use-planner-plans';
import { usePlannerStore } from '@/store/planner-store';
import { createTask, deleteTask, toggleTask, updateTask } from '@/lib/planner/task-service';
import { awardXp } from '@/lib/gamification/xp-service';
import { cn } from '@/lib/utils';

// Premium components
import { PlannerHero } from '@/components/planner/premium/planner-hero';
import { DailyMissionCard } from '@/components/planner/premium/daily-mission-card';
import { ExamCountdown } from '@/components/planner/premium/exam-countdown';
import { AchievementsPanel } from '@/components/planner/premium/achievements-panel';
import { RecentActivity } from '@/components/planner/premium/recent-activity';
import { StudyTimeline } from '@/components/planner/premium/study-timeline';
import { FocusAnalytics } from '@/components/planner/premium/focus-analytics';
import { StudyHeatmap } from '@/components/planner/premium/study-heatmap';
import { SubjectProgress } from '@/components/planner/premium/subject-progress';
import { AiCoachPanel } from '@/components/planner/premium/ai-coach-panel';
import { AiSmartPlanner } from '@/components/planner/premium/ai-smart-planner';
import { GoalsTab } from '@/components/planner/premium/goals-tab';
import { HabitsTab } from '@/components/planner/premium/habits-tab';
import { HabitsOverviewPanel } from '@/components/planner/premium/habits-overview-panel';

// Hooks
import { usePlannerInsights } from '@/hooks/use-planner-insights';
import { useLifeGoalsSync } from '@/hooks/use-lifegoals';
import { useHabitsSync } from '@/hooks/use-habits';
import { useSessionsSync } from '@/hooks/use-sessions';

// Analytics & coach
import { buildFocusAnalytics, buildSubjectStats, buildTodayTimeline, buildHeatmap } from '@/lib/planner/analytics';
import { buildCoachReport } from '@/lib/planner/ai-coach';
import { useHabitInsights } from '@/hooks/use-habit-insights';

// Sessions from pomodoro store
import { usePomodoroStore } from '@/store/pomodoro-store';

import type { NewTask, Task, WeeklySlot } from '@/lib/firestore/planner-schema';

type Tab = 'overview' | 'tasks' | 'goals' | 'habits' | 'analytics' | 'coach';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'overview',   label: 'Overview',   emoji: '🏠' },
  { id: 'tasks',      label: 'Tasks',      emoji: '✅' },
  { id: 'goals',      label: 'Goals',      emoji: '🎯' },
  { id: 'habits',     label: 'Habits',     emoji: '🔥' },
  { id: 'analytics',  label: 'Analytics',  emoji: '📊' },
  { id: 'coach',      label: 'AI Coach',   emoji: '🤖' },
];

export default function PlannerPage() {
  useTasksSync();
  usePlannerPlansSync();
  useLifeGoalsSync();
  useHabitsSync();
  useSessionsSync();

  const { user } = useAuth();
  const { tasks, loading } = usePlannerStore();
  const weeklySlots = usePlannerStore((s) => s.weeklySlots);
  const sessions = usePomodoroStore((s) => s.sessions);
  const insights = usePlannerInsights();
  const upcomingGoals = useUpcomingGoals();
  const habitInsights = useHabitInsights();

  const [tab, setTab] = useState<Tab>('overview');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const grouped = useMemo(() => ({
    pending: tasks.filter((t) => !t.completed),
    done: tasks.filter((t) => t.completed),
  }), [tasks]);

  const focusAnalytics = useMemo(() => buildFocusAnalytics(sessions), [sessions]);
  const subjectStats   = useMemo(() => buildSubjectStats(tasks, sessions), [tasks, sessions]);
  const todayTimeline  = useMemo(() => buildTodayTimeline(weeklySlots), [weeklySlots]);
  const heatmapDays    = useMemo(() => buildHeatmap(sessions), [sessions]);
  const coachReport    = useMemo(
    () => buildCoachReport(insights.dashboardStats, focusAnalytics, subjectStats, habitInsights),
    [insights.dashboardStats, focusAnalytics, subjectStats, habitInsights]
  );

  async function handleSubmit(data: NewTask) {
    if (!requireAuth(user)) return;
    try {
      if (editing) await updateTask(user.uid, editing.id, data);
      else await createTask(user.uid, data);
      toast.success(editing ? 'Task updated' : 'Task created');
    } catch { toast.error('Could not save task'); }
    finally { setDialogOpen(false); setEditing(null); }
  }

  async function handleToggle(task: Task) {
    if (!requireAuth(user)) return;
    const nowCompleted = !task.completed;
    await toggleTask(user.uid, task.id, nowCompleted);
    if (nowCompleted) void awardXp(user.uid, 'completeTask');
  }

  async function handleDelete(task: Task) {
    if (!requireAuth(user)) return;
    await deleteTask(user.uid, task.id);
    toast.success('Task deleted');
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const overdueTasks = useMemo(
    () => tasks.filter((t) => !t.completed && t.dueDate < todayIso).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks, todayIso]
  );

  const weeklyCompletion = useMemo(() => {
    const weekAgoIso = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const dueThisWeek = tasks.filter((t) => t.dueDate >= weekAgoIso && t.dueDate <= todayIso);
    if (dueThisWeek.length === 0) return null;
    const done = dueThisWeek.filter((t) => t.completed).length;
    return Math.round((done / dueThisWeek.length) * 100);
  }, [tasks, todayIso]);

  async function handleQuickComplete(task: Task) {
    if (!requireAuth(user)) return;
    await toggleTask(user.uid, task.id, true);
    void awardXp(user.uid, 'completeTask');
    toast.success(`"${task.title}" done — no more nagging about it!`);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Habits overview (shows when habits exist) ── */}
      <HabitsOverviewPanel />

      {/* ── Page title + action ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Life Planner</h1>
          <p className="text-sm text-muted-foreground">Your AI-powered life operating system.</p>
        </div>
        <div className="flex items-center gap-3">
          {weeklyCompletion !== null && (
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:flex">
              <span className={cn('text-sm font-bold', weeklyCompletion >= 80 ? 'text-emerald-400' : weeklyCompletion >= 50 ? 'text-amber-400' : 'text-red-400')}>
                {weeklyCompletion}%
              </span>
              <span className="text-xs text-muted-foreground">completion this week</span>
            </div>
          )}
          {tab === 'tasks' && (
            <Button variant="gradient" onClick={() => { setEditing(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> New task
            </Button>
          )}
        </div>
      </div>

      {/* ── STRICT: overdue tasks are impossible to miss, on every tab ── */}
      {overdueTasks.length > 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.07] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <h2 className="text-sm font-bold text-red-300">
              {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''} — you committed to these
            </h2>
          </div>
          <div className="space-y-1.5">
            {overdueTasks.slice(0, 5).map((t) => {
              const daysLate = Math.floor((new Date(todayIso).getTime() - new Date(t.dueDate).getTime()) / 86400000);
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-charcoal-900/60 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-red-400">{daysLate} day{daysLate > 1 ? 's' : ''} late</p>
                  </div>
                  <button
                    onClick={() => handleQuickComplete(t)}
                    className="shrink-0 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25"
                  >
                    Mark done
                  </button>
                </div>
              );
            })}
          </div>
          {overdueTasks.length > 5 && (
            <button onClick={() => setTab('tasks')} className="mt-2 text-xs text-red-300 hover:underline">
              +{overdueTasks.length - 5} more overdue \u2192
            </button>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex w-fit gap-1 rounded-xl bg-secondary p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                tab === t.id ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <DailyMissionCard insights={insights} onManageAll={() => setTab('tasks')} />
            <StudyTimeline blocks={todayTimeline} />
            <ExamCountdown goals={upcomingGoals} />
            <RecentActivity tasks={tasks} sessions={sessions} goals={upcomingGoals} />
          </div>

          {/* ── Stats — moved below the actionable cards; not very useful up top when all zero for new users ── */}
          <PlannerHero insights={insights} />
        </div>
      )}

      {/* ── TASKS TAB ── */}
      {tab === 'tasks' && (
        <div className="space-y-5">
          {/* Task daily/weekly/monthly sub-tabs */}
          <TasksSection
            tasks={tasks} loading={loading} grouped={grouped}
            weeklySlots={weeklySlots}
            onToggle={handleToggle}
            onEdit={(t) => { setEditing(t); setDialogOpen(true); }}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* ── GOALS TAB ── */}
      {tab === 'goals' && <GoalsTab />}

      {/* ── HABITS TAB ── */}
      {tab === 'habits' && <HabitsTab />}

      {/* ── ANALYTICS TAB ── */}
      {tab === 'analytics' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <FocusAnalytics data={focusAnalytics} />
          <StudyHeatmap days={heatmapDays} />
          <div className="lg:col-span-2">
            <SubjectProgress subjects={subjectStats} />
          </div>
        </div>
      )}

      {/* ── AI COACH TAB ── */}
      {tab === 'coach' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <AiCoachPanel report={coachReport} />
          <AchievementsPanel gamification={insights.gamification} />
          <div className="lg:col-span-2">
            <AiSmartPlanner weeklySlots={weeklySlots} />
          </div>
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        initial={editing}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// ── Tasks section with internal sub-tabs ──────────────────────────────────────
type SubTab = 'daily' | 'weekly' | 'monthly';

function TasksSection({ tasks, loading, grouped, weeklySlots, onToggle, onEdit, onDelete }: {
  tasks: Task[];
  loading: boolean;
  grouped: { pending: Task[]; done: Task[] };
  weeklySlots: WeeklySlot[];
  onToggle: (t: Task) => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const [sub, setSub] = useState<SubTab>('daily');
  const weeklyLoading = usePlannerStore((s) => s.weeklyLoading);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl bg-secondary/60 p-1 w-fit">
        {(['daily', 'weekly', 'monthly'] as SubTab[]).map((s) => (
          <button
            key={s}
            onClick={() => setSub(s)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors',
              sub === s ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {sub === 'daily' && (
        <div className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading tasks...</p>}
          {!loading && tasks.length === 0 && (
            <GlassCard><p className="text-sm text-muted-foreground">No tasks yet. Create your first one!</p></GlassCard>
          )}
          {grouped.pending.map((t) => (
            <TaskItem key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
          ))}
          {grouped.done.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Completed</p>
              {grouped.done.map((t) => (
                <TaskItem key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </>
          )}
        </div>
      )}

      {sub === 'weekly' && (
        weeklyLoading ? (
          <p className="text-sm text-muted-foreground">Loading weekly plan...</p>
        ) : weeklySlots.length === 0 ? (
          <GlassCard><p className="text-sm text-muted-foreground">No weekly plan yet. Generate one in the AI Coach tab.</p></GlassCard>
        ) : (
          <WeeklyGrid slots={weeklySlots} />
        )
      )}

      {sub === 'monthly' && <MonthlyView />}
    </div>
  );
}