'use client';

import { useEffect, useMemo, useState, type ElementType, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Plus, CalendarDays, ListChecks, Target, Flame, BarChart3, Check, Circle, Clock3, BookOpen, ListTodo, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { TaskItem } from '@/components/planner/task-item';
import { TaskDialog } from '@/components/planner/task-dialog';
import { WeeklyGrid } from '@/components/planner/weekly-grid';
import { MonthlyView } from '@/components/planner/monthly-view';
import { DayCommandCenter } from '@/components/planner/premium/day-command-center';
import { FocusAnalytics } from '@/components/planner/premium/focus-analytics';
import { StudyHeatmap } from '@/components/planner/premium/study-heatmap';
import { SubjectProgress } from '@/components/planner/premium/subject-progress';
import { AiCoachPanel } from '@/components/planner/premium/ai-coach-panel';
import { AiSmartPlanner } from '@/components/planner/premium/ai-smart-planner';
import { GoalsTab } from '@/components/planner/premium/goals-tab';
import { HabitsTab } from '@/components/planner/premium/habits-tab';
import { DeadlineCommandCard } from '@/components/planner/premium/deadline-command-card';
import { useTasksSync } from '@/hooks/use-tasks';
import { usePlannerPlansSync } from '@/hooks/use-planner-plans';
import { useLifeGoalsSync } from '@/hooks/use-lifegoals';
import { useHabitsSync } from '@/hooks/use-habits';
import { useSessionsSync } from '@/hooks/use-sessions';
import { usePlannerInsights } from '@/hooks/use-planner-insights';
import { useHabitInsights } from '@/hooks/use-habit-insights';
import { useAuth } from '@/hooks/use-auth';
import { usePlannerStore } from '@/store/planner-store';
import { usePomodoroStore } from '@/store/pomodoro-store';
import { createTask, deleteTask, toggleTask, updateTask } from '@/lib/planner/task-service';
import { awardXp } from '@/lib/gamification/xp-service';
import { buildFocusAnalytics, buildSubjectStats, buildHeatmap } from '@/lib/planner/analytics';
import { buildCoachReport } from '@/lib/planner/ai-coach';
import { requireAuth } from '@/lib/require-auth';
import { cn } from '@/lib/utils';
import type { NewTask, Task, WeeklySlot } from '@/lib/firestore/planner-schema';
import { toDateKey } from '@/lib/planner/date-keys';

type Tab = 'today' | 'tasks' | 'goals' | 'habits' | 'insights' | 'coach';
const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' }, { id: 'tasks', label: 'Tasks' }, { id: 'goals', label: 'Goals' },
  { id: 'habits', label: 'Habits' }, { id: 'insights', label: 'Insights' }, { id: 'coach', label: 'AI Coach' },
];

export default function PlannerPage() {
  useTasksSync(); usePlannerPlansSync(); useLifeGoalsSync(); useHabitsSync(); useSessionsSync();
  const { user } = useAuth();
  const { tasks, loading } = usePlannerStore();
  const weeklySlots = usePlannerStore((s) => s.weeklySlots);
  const weeklyLoading = usePlannerStore((s) => s.weeklyLoading);
  const sessions = usePomodoroStore((s) => s.sessions);
  const insights = usePlannerInsights(); const habitInsights = useHabitInsights();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab') as Tab | null;
  const initialTab: Tab = requestedTab && TABS.some((item) => item.id === requestedTab) ? requestedTab : 'today';
  const [tab, setTab] = useState<Tab>(initialTab); const [dialogOpen, setDialogOpen] = useState(false); const [editing, setEditing] = useState<Task | null>(null);
  const grouped = useMemo(() => ({ pending: tasks.filter((t) => !t.completed), done: tasks.filter((t) => t.completed) }), [tasks]);
  const focusAnalytics = useMemo(() => buildFocusAnalytics(sessions), [sessions]);
  const subjectStats = useMemo(() => buildSubjectStats(tasks, sessions), [tasks, sessions]);
  const heatmapDays = useMemo(() => buildHeatmap(sessions), [sessions]);
  const coachReport = useMemo(() => buildCoachReport(insights.dashboardStats, focusAnalytics, subjectStats, habitInsights), [insights.dashboardStats, focusAnalytics, subjectStats, habitInsights]);
  async function handleSubmit(data: NewTask) { if (!requireAuth(user)) return; try { if (editing) await updateTask(user.uid, editing.id, data); else await createTask(user.uid, data); toast.success(editing ? 'Task updated' : 'Task created'); } catch { toast.error('Could not save task'); } finally { setDialogOpen(false); setEditing(null); } }
  async function handleToggle(task: Task) { if (!requireAuth(user)) return; const completed = !task.completed; await toggleTask(user.uid, task.id, completed); if (completed) void awardXp(user.uid, 'completeTask'); }
  async function handleDelete(task: Task) { if (!requireAuth(user)) return; await deleteTask(user.uid, task.id); toast.success('Task deleted'); }
  const todayIso = toDateKey();
  const overdueTasks = useMemo(() => tasks.filter((task) => !task.completed && task.dueDate < todayIso), [tasks, todayIso]);
  const tasksToday = useMemo(() => tasks.filter((t) => t.dueDate === todayIso), [tasks, todayIso]);
  useEffect(() => { if (requestedTab && TABS.some((item) => item.id === requestedTab)) setTab(requestedTab); }, [requestedTab]);
  const tabIcons: Record<Tab, ElementType> = {
    today: CalendarDays, tasks: ListChecks, goals: Target, habits: Flame, insights: BarChart3, coach: Sparkles
  };

  return <div className="min-h-full animate-fade-in bg-[#F8F7FF] text-slate-950 dark:bg-background dark:text-foreground">
    <div className="mx-auto max-w-[430px] space-y-4 px-4 pb-8 pt-3 sm:px-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[30px] font-black leading-none tracking-[-0.04em] text-[#2D1B69] dark:text-foreground">Life Planner</h1>
          <p className="mt-2 text-[13px] leading-5 text-slate-500 dark:text-muted-foreground">One command center for your day • tasks, goals, habits and progress</p>
        </div>
        <Button variant="gradient" className="h-11 shrink-0 rounded-2xl px-4 text-sm font-bold shadow-lg shadow-primary/20" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" /> Plan task
        </Button>
      </header>

      <nav className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:border-border dark:bg-card" aria-label="Planner sections">
        <div className="grid grid-cols-5">
          {TABS.filter((item) => item.id !== 'coach').map((item) => {
            const Icon = tabIcons[item.id];
            return <button key={item.id} type="button" onClick={() => setTab(item.id)}
              className={cn("relative flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[12px] font-bold transition-colors",
                tab === item.id ? "text-[#2D1B69] dark:text-foreground" : "text-slate-500 dark:text-muted-foreground")}>
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {tab === item.id && <span className="absolute bottom-0 left-2 right-2 h-1 rounded-full bg-[#8B5CF6]" />}
            </button>;
          })}
        </div>
      </nav>

      {tab === 'today' && <PlannerReferenceToday tasks={tasksToday} onToggle={handleToggle} onEdit={(task) => { setEditing(task); setDialogOpen(true); }} />}
      {tab === 'tasks' && <TasksWorkspace tasks={tasks} tasksToday={tasksToday} grouped={grouped} loading={loading} weeklySlots={weeklySlots} weeklyLoading={weeklyLoading} onToggle={handleToggle} onEdit={(task) => { setEditing(task); setDialogOpen(true); }} onDelete={handleDelete} />}
      {tab === 'goals' && <GoalsTab />}
      {tab === 'habits' && <HabitsTab />}
      {tab === 'insights' && <div className="space-y-5"><section className="grid gap-5 lg:grid-cols-2"><FocusAnalytics data={focusAnalytics} /><StudyHeatmap days={heatmapDays} /></section><SubjectProgress subjects={subjectStats} /></div>}
      {tab === 'coach' && <div className="space-y-5"><section className="grid gap-5 lg:grid-cols-2"><AiCoachPanel report={coachReport} /><div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.035] p-5"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">Planner Intelligence</p><h2 className="mt-2 text-xl font-bold">Turn real activity into a realistic plan.</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Suggestions use your current workload, focus history and habits instead of inventing progress.</p></div></section><AiSmartPlanner weeklySlots={weeklySlots} /></div>}
      <TaskDialog open={dialogOpen} initial={editing} onClose={() => { setDialogOpen(false); setEditing(null); }} onSubmit={handleSubmit} />
    </div>
  </div>;
}  const tabIcons: Record<Tab, React.ElementType> = {
    today: CalendarDays, tasks: ListChecks, goals: Target, habits: Flame, insights: BarChart3, coach: Sparkles
  };

  return <div className="min-h-full animate-fade-in bg-[#F8F7FF] text-slate-950 dark:bg-background dark:text-foreground">
    <div className="mx-auto max-w-[430px] space-y-4 px-4 pb-8 pt-3 sm:px-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[30px] font-black leading-none tracking-[-0.04em] text-[#2D1B69] dark:text-foreground">Life Planner</h1>
          <p className="mt-2 text-[13px] leading-5 text-slate-500 dark:text-muted-foreground">One command center for your day • tasks, goals, habits and progress</p>
        </div>
        <Button variant="gradient" className="h-11 shrink-0 rounded-2xl px-4 text-sm font-bold shadow-lg shadow-primary/20" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" /> Plan task
        </Button>
      </header>

      <nav className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:border-border dark:bg-card" aria-label="Planner sections">
        <div className="grid grid-cols-5">
          {TABS.filter((item) => item.id !== 'coach').map((item) => {
            const Icon = tabIcons[item.id];
            return <button key={item.id} type="button" onClick={() => setTab(item.id)}
              className={cn("relative flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[12px] font-bold transition-colors",
                tab === item.id ? "text-[#2D1B69] dark:text-foreground" : "text-slate-500 dark:text-muted-foreground")}>
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {tab === item.id && <span className="absolute bottom-0 left-2 right-2 h-1 rounded-full bg-[#8B5CF6]" />}
            </button>;
          })}
        </div>
      </nav>

      {tab === 'today' && <PlannerReferenceToday tasks={tasksToday} onToggle={handleToggle} onEdit={(task) => { setEditing(task); setDialogOpen(true); }} />}
      {tab === 'tasks' && <TasksWorkspace tasks={tasks} tasksToday={tasksToday} grouped={grouped} loading={loading} weeklySlots={weeklySlots} weeklyLoading={weeklyLoading} onToggle={handleToggle} onEdit={(task) => { setEditing(task); setDialogOpen(true); }} onDelete={handleDelete} />}
      {tab === 'goals' && <GoalsTab />}
      {tab === 'habits' && <HabitsTab />}
      {tab === 'insights' && <div className="space-y-5"><section className="grid gap-5 lg:grid-cols-2"><FocusAnalytics data={focusAnalytics} /><StudyHeatmap days={heatmapDays} /></section><SubjectProgress subjects={subjectStats} /></div>}
      {tab === 'coach' && <div className="space-y-5"><section className="grid gap-5 lg:grid-cols-2"><AiCoachPanel report={coachReport} /><div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.035] p-5"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">Planner Intelligence</p><h2 className="mt-2 text-xl font-bold">Turn real activity into a realistic plan.</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Suggestions use your current workload, focus history and habits instead of inventing progress.</p></div></section><AiSmartPlanner weeklySlots={weeklySlots} /></div>}
      <TaskDialog open={dialogOpen} initial={editing} onClose={() => { setDialogOpen(false); setEditing(null); }} onSubmit={handleSubmit} />
    </div>
  </div>;
function OverdueTasks({ tasks, onMoveToToday, onMarkDone }: { tasks: Task[]; onMoveToToday: (task: Task) => Promise<void>; onMarkDone: (task: Task) => void }) {
  if (tasks.length === 0) return null;
  return <GlassCard className="border-amber-400/20 bg-amber-400/[0.035]">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-sm font-bold text-amber-200">Overdue / बकाया</p><p className="mt-1 text-xs text-muted-foreground">Move unfinished tasks to today or mark them done / अधूरे काम आज पर लाएं या पूरा करें।</p></div>
      <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[11px] text-amber-200">{tasks.length}</span>
    </div>
    <div className="mt-3 space-y-2">{tasks.map((task) => <div key={task.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-background/40 p-3">
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{task.title}</p><p className="text-[11px] text-muted-foreground">{task.dueDate} · {task.priority}</p></div>
      <Button size="sm" variant="outline" onClick={() => void onMoveToToday(task)}>Move to today / आज करें</Button>
      <Button size="sm" variant="gradient" onClick={() => onMarkDone(task)}>Mark done / पूरा करें</Button>
    </div>)}</div>
  </GlassCard>;
}

function TasksWorkspace({ tasks, tasksToday, grouped, loading, weeklySlots, weeklyLoading, onToggle, onEdit, onDelete }: { tasks: Task[]; tasksToday: Task[]; grouped: { pending: Task[]; done: Task[] }; loading: boolean; weeklySlots: WeeklySlot[]; weeklyLoading: boolean; onToggle: (task: Task) => void; onEdit: (task: Task) => void; onDelete: (task: Task) => void; }) {
  const [view, setView] = useState<'today' | 'all' | 'weekly' | 'monthly'>('today');
  return <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold">Task workspace</p><p className="text-xs text-muted-foreground">Keep execution simple. Use the timeline for time, tasks for everything else.</p></div><div className="flex rounded-xl border border-white/10 bg-white/[0.035] p-1">{(['today', 'all', 'weekly', 'monthly'] as const).map((item) => <button key={item} type="button" onClick={() => setView(item)} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors', view === item ? 'bg-white/[0.09] text-foreground' : 'text-muted-foreground hover:text-foreground')}>{item}</button>)}</div></div>
    {view === 'today' && <div className="space-y-4">{loading ? <p className="text-sm text-muted-foreground">Loading your tasks…</p> : tasksToday.length > 0 ? <TodaySchedule tasksToday={tasksToday} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} /> : <GlassCard><p className="text-sm font-semibold">Nothing is due today.</p><p className="mt-1 text-xs text-muted-foreground">Use Plan task above to create a focused block.</p></GlassCard>}</div>}
    {view === 'all' && <div className="space-y-5"><TaskGroup title="Active" tasks={grouped.pending} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} /><TaskGroup title="Completed" tasks={grouped.done} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} /></div>}
    {view === 'weekly' && (weeklyLoading ? <p className="text-sm text-muted-foreground">Loading weekly plan…</p> : weeklySlots.length > 0 ? <WeeklyGrid slots={weeklySlots} /> : <GlassCard><p className="text-sm font-semibold">No weekly plan yet.</p><p className="mt-1 text-xs text-muted-foreground">Open AI Coach and generate a plan from your current workload.</p></GlassCard>)}
    {view === 'monthly' && <MonthlyView />}
  </section>;
}
function TodaySchedule({ tasksToday, onToggle, onEdit, onDelete }: { tasksToday: Task[]; onToggle: (task: Task) => void; onEdit: (task: Task) => void; onDelete: (task: Task) => void }) { const scheduled = [...tasksToday].sort((a, b) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99')); const timed = scheduled.filter((task) => task.startTime); const unscheduled = scheduled.filter((task) => !task.startTime); return <div className="space-y-3">{timed.map((task) => <div key={task.id} className="grid grid-cols-[72px_1fr] gap-3 items-start"><div className="pt-3 text-right text-xs font-semibold text-violet-300">{task.startTime}</div><div className="relative rounded-2xl border border-violet-400/15 bg-violet-400/[0.035] p-1"><TaskItem task={task} onToggle={() => onToggle(task)} onEdit={() => onEdit(task)} onDelete={() => onDelete(task)} />{task.endTime && <p className="px-3 pb-2 text-[11px] text-muted-foreground">Until {task.endTime}</p>}</div></div>)}{unscheduled.length > 0 && <div className="space-y-2 pt-2"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Unscheduled</p>{unscheduled.map((task) => <TaskItem key={task.id} task={task} onToggle={() => onToggle(task)} onEdit={() => onEdit(task)} onDelete={() => onDelete(task)} />)}</div>}</div>; }
function TaskGroup({ title, tasks, onToggle, onEdit, onDelete }: { title: string; tasks: Task[]; onToggle: (task: Task) => void; onEdit: (task: Task) => void; onDelete: (task: Task) => void; }) { return <div className="space-y-2"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{title}</p><span className="text-xs text-muted-foreground">{tasks.length}</span></div>{tasks.length === 0 ? <GlassCard><p className="text-sm text-muted-foreground">Nothing here.</p></GlassCard> : tasks.map((task) => <TaskItem key={task.id} task={task} onToggle={() => onToggle(task)} onEdit={() => onEdit(task)} onDelete={() => onDelete(task)} />)}</div>; }
