'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { TaskItem } from '@/components/planner/task-item';
import { TaskDialog } from '@/components/planner/task-dialog';
import { WeeklyGrid } from '@/components/planner/weekly-grid';
import { MonthlyView } from '@/components/planner/monthly-view';
import { TodaySchedule } from '@/components/planner/premium/today-schedule';
import { DayCommandCenter } from '@/components/planner/premium/day-command-center';
import { FocusAnalytics } from '@/components/planner/premium/focus-analytics';
import { StudyHeatmap } from '@/components/planner/premium/study-heatmap';
import { SubjectProgress } from '@/components/planner/premium/subject-progress';
import { AiCoachPanel } from '@/components/planner/premium/ai-coach-panel';
import { AiSmartPlanner } from '@/components/planner/premium/ai-smart-planner';
import { GoalsTab } from '@/components/planner/premium/goals-tab';
import { HabitsTab } from '@/components/planner/premium/habits-tab';
import { useTasksSync } from '@/hooks/use-tasks';
import { usePlannerPlansSync } from '@/hooks/use-planner-plans';
import { useLifeGoalsSync } from '@/hooks/use-lifegoals';
import { useHabitsSync } from '@/hooks/use-habits';
import { useSessionsSync } from '@/hooks/use-sessions';
import { usePlannerInsights } from '@/hooks/use-planner-insights';
import { useHabitInsights } from '@/hooks/use-habit-insights';
import { usePlannerStore } from '@/store/planner-store';
import { usePomodoroStore } from '@/store/pomodoro-store';
import { createTask, deleteTask, toggleTask, updateTask } from '@/lib/planner/task-service';
import { awardXp } from '@/lib/gamification/xp-service';
import { buildFocusAnalytics, buildSubjectStats, buildHeatmap } from '@/lib/planner/analytics';
import { buildCoachReport } from '@/lib/planner/ai-coach';
import { requireAuth } from '@/lib/require-auth';
import { cn } from '@/lib/utils';
import type { NewTask, Task, WeeklySlot } from '@/lib/firestore/planner-schema';

type Tab = 'today' | 'tasks' | 'goals' | 'habits' | 'insights' | 'coach';

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'goals', label: 'Goals' },
  { id: 'habits', label: 'Habits' },
  { id: 'insights', label: 'Insights' },
  { id: 'coach', label: 'AI Coach' },
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
  const weeklyLoading = usePlannerStore((s) => s.weeklyLoading);
  const sessions = usePomodoroStore((s) => s.sessions);
  const insights = usePlannerInsights();
  const habitInsights = useHabitInsights();

  const [tab, setTab] = useState<Tab>('today');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const grouped = useMemo(() => ({
    pending: tasks.filter((t) => !t.completed),
    done: tasks.filter((t) => t.completed),
  }), [tasks]);

  const focusAnalytics = useMemo(() => buildFocusAnalytics(sessions), [sessions]);
  const subjectStats = useMemo(() => buildSubjectStats(tasks, sessions), [tasks, sessions]);
  const heatmapDays = useMemo(() => buildHeatmap(sessions), [sessions]);
  const coachReport = useMemo(
    () => buildCoachReport(insights.dashboardStats, focusAnalytics, subjectStats, habitInsights),
    [insights.dashboardStats, focusAnalytics, subjectStats, habitInsights]
  );

  async function handleSubmit(data: NewTask) {
    if (!requireAuth(user)) return;
    try {
      if (editing) await updateTask(user.uid, editing.id, data);
      else await createTask(user.uid, data);
      toast.success(editing ? 'Task updated' : 'Task created');
    } catch {
      toast.error('Could not save task');
    } finally {
      setDialogOpen(false);
      setEditing(null);
    }
  }

  async function handleToggle(task: Task) {
    if (!requireAuth(user)) return;
    const completed = !task.completed;
    await toggleTask(user.uid, task.id, completed);
    if (completed) void awardXp(user.uid, 'completeTask');
  }

  async function handleDelete(task: Task) {
    if (!requireAuth(user)) return;
    await deleteTask(user.uid, task.id);
    toast.success('Task deleted');
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const tasksToday = useMemo(() => tasks.filter((t) => t.dueDate === todayIso), [tasks, todayIso]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium page header: deliberately quiet, no duplicate KPI cards. */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">Life OS</p>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Planner</h1>
          <p className="mt-1 text-sm text-muted-foreground">One system for deciding what matters, when it happens, and what comes next.</p>
        </div>
        <Button
          variant="gradient"
          onClick={() => { setEditing(null); setDialogOpen(true); }}
        >
          <Plus className="h-4 w-4" /> Plan task
        </Button>
      </header>

      {/* Clean primary navigation — no emoji, no decorative labels. */}
      <nav className="overflow-x-auto pb-1 scrollbar-hide" aria-label="Planner sections">
        <div className="flex w-fit items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.035] p-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                tab === item.id
                  ? 'bg-white/[0.10] text-foreground shadow-sm ring-1 ring-white/10'
                  : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {tab === 'today' && (
        <DayCommandCenter
          tasks={tasks}
          onToggle={handleToggle}
          onEdit={(task) => { setEditing(task); setDialogOpen(true); }}
          onNewTask={() => { setEditing(null); setDialogOpen(true); }}
        />
      )}

      {tab === 'tasks' && (
        <TasksWorkspace
          tasks={tasks}
          tasksToday={tasksToday}
          grouped={grouped}
          loading={loading}
          weeklySlots={weeklySlots}
          weeklyLoading={weeklyLoading}
          onToggle={handleToggle}
          onEdit={(task) => { setEditing(task); setDialogOpen(true); }}
          onDelete={handleDelete}
        />
      )}

      {tab === 'goals' && <GoalsTab />}
      {tab === 'habits' && <HabitsTab />}

      {tab === 'insights' && (
        <div className="space-y-5">
          <section className="grid gap-5 lg:grid-cols-2">
            <FocusAnalytics data={focusAnalytics} />
            <StudyHeatmap days={heatmapDays} />
          </section>
          <SubjectProgress subjects={subjectStats} />
        </div>
      )}

      {tab === 'coach' && (
        <div className="space-y-5">
          <section className="grid gap-5 lg:grid-cols-2">
            <AiCoachPanel report={coachReport} />
            <div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.035] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">Decision support</p>
              <h2 className="mt-2 text-xl font-bold">Turn insight into a plan.</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Generate a focused weekly schedule from your current workload instead of manually filling every slot.
              </p>
            </div>
          </section>
          <AiSmartPlanner weeklySlots={weeklySlots} />
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

function TasksWorkspace({
  tasks,
  tasksToday,
  grouped,
  loading,
  weeklySlots,
  weeklyLoading,
  onToggle,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  tasksToday: Task[];
  grouped: { pending: Task[]; done: Task[] };
  loading: boolean;
  weeklySlots: WeeklySlot[];
  weeklyLoading: boolean;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const [view, setView] = useState<'today' | 'all' | 'weekly' | 'monthly'>('today');

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">Task workspace</p>
          <p className="text-xs text-muted-foreground">Keep execution simple. Use the timeline for time, tasks for everything else.</p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-white/[0.035] p-1">
          {(['today', 'all', 'weekly', 'monthly'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                view === item ? 'bg-white/[0.09] text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {view === 'today' && (
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading your tasks…</p>
          ) : tasksToday.length > 0 ? (
            <TodaySchedule tasksToday={tasksToday} onToggle={onToggle} />
          ) : (
            <GlassCard>
              <p className="text-sm font-semibold">Nothing is due today.</p>
              <p className="mt-1 text-xs text-muted-foreground">Use Plan task above to create a focused block.</p>
            </GlassCard>
          )}
        </div>
      )}

      {view === 'all' && (
        <div className="space-y-5">
          <TaskGroup title="Active" tasks={grouped.pending} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
          <TaskGroup title="Completed" tasks={grouped.done} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}

      {view === 'weekly' && (
        weeklyLoading ? (
          <p className="text-sm text-muted-foreground">Loading weekly plan…</p>
        ) : weeklySlots.length > 0 ? (
          <WeeklyGrid slots={weeklySlots} />
        ) : (
          <GlassCard>
            <p className="text-sm font-semibold">No weekly plan yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">Open AI Coach and generate a plan from your current workload.</p>
          </GlassCard>
        )
      )}

      {view === 'monthly' && <MonthlyView />}
    </section>
  );
}

function TaskGroup({
  title,
  tasks,
  onToggle,
  onEdit,
  onDelete,
}: {
  title: string;
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <GlassCard><p className="text-sm text-muted-foreground">Nothing here.</p></GlassCard>
      ) : (
        tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))
      )}
    </div>
  );
}
