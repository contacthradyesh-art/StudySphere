'use client';

import { useEffect, useMemo, useState, type ReactNode, type ElementType } from 'react';
import { toast } from 'sonner';
import { Plus, CalendarDays, ListChecks, Target, Flame, BarChart3, Check, Circle, Clock3, BookOpen, ListTodo, Sparkles, Droplet, Dumbbell, Moon, Brain } from 'lucide-react';
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
import { toggleHabitLog } from '@/lib/habits/habit-service';
import type { HabitProgress } from '@/hooks/use-habit-insights';
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
  const tabIcons: Record<Tab, ElementType> = { today: CalendarDays, tasks: ListChecks, goals: Target, habits: Flame, insights: BarChart3, coach: Sparkles };
  return <div className="min-h-full animate-fade-in bg-[#F8F7FF] text-slate-950 dark:bg-background dark:text-foreground">
    <div className="mx-auto max-w-[430px] space-y-4 px-4 pb-8 pt-3 sm:px-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="text-[30px] font-black leading-none tracking-[-0.04em] text-[#2D1B69] dark:text-foreground">Life Planner</h1><p className="mt-2 text-[13px] leading-5 text-slate-500 dark:text-muted-foreground">One command center for your day • tasks, goals, habits and progress</p></div>
        <Button variant="gradient" className="h-11 shrink-0 rounded-2xl px-4 text-sm font-bold shadow-lg shadow-primary/20" onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> Plan task</Button>
      </header>
      <nav className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:border-border dark:bg-card"><div className="grid grid-cols-5">
        {TABS.filter((item) => item.id !== 'coach').map((item) => { const Icon = tabIcons[item.id]; return <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cn("relative flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[12px] font-bold", tab === item.id ? "text-[#2D1B69] dark:text-foreground" : "text-slate-500 dark:text-muted-foreground")}><Icon className="h-5 w-5" /><span>{item.label}</span>{tab === item.id && <span className="absolute bottom-0 left-2 right-2 h-1 rounded-full bg-[#8B5CF6]" />}</button>; })}
      </div></nav>
      {tab === 'today' && <PlannerReferenceToday tasks={tasksToday} onToggle={handleToggle} habits={habitInsights.habitProgress} onToggleHabit={(habitId, completed) => { if (user) void toggleHabitLog(user.uid, habitId, todayIso, completed); }} />}
      {tab === 'tasks' && <TasksWorkspace tasks={tasks} tasksToday={tasksToday} grouped={grouped} loading={loading} weeklySlots={weeklySlots} weeklyLoading={weeklyLoading} onToggle={handleToggle} onEdit={(task) => { setEditing(task); setDialogOpen(true); }} onDelete={handleDelete} />}
      {tab === 'goals' && <GoalsTab />}{tab === 'habits' && <HabitsTab />}
      {tab === 'insights' && <div className="space-y-5"><section className="grid gap-5 lg:grid-cols-2"><FocusAnalytics data={focusAnalytics} /><StudyHeatmap days={heatmapDays} /></section><SubjectProgress subjects={subjectStats} /></div>}
      {tab === 'coach' && <div className="space-y-5"><section className="grid gap-5 lg:grid-cols-2"><AiCoachPanel report={coachReport} /><div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.035] p-5"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">Planner Intelligence</p><h2 className="mt-2 text-xl font-bold">Turn real activity into a realistic plan.</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Suggestions use your current workload, focus history and habits instead of inventing progress.</p></div></section><AiSmartPlanner weeklySlots={weeklySlots} /></div>}
      <TaskDialog open={dialogOpen} initial={editing} onClose={() => { setDialogOpen(false); setEditing(null); }} onSubmit={handleSubmit} />
    </div>
  </div>;
}

function PlannerReferenceToday({ tasks, onToggle, habits, onToggleHabit }: { tasks: Task[]; onToggle: (task: Task) => void; habits: HabitProgress[]; onToggleHabit: (habitId: string, completed: boolean) => void }) {
  const fallback = [
    { title: 'Complete UPSSSC PET mock', priority: 'High', time: '9:00 AM', tone: 'high' },
    { title: 'Review PYQ set', priority: 'Medium', time: '11:30 AM', tone: 'medium' },
    { title: 'Practice Reasoning Section', priority: 'Low', time: '2:00 PM', tone: 'low' },
  ];
  const rows = tasks.length
    ? tasks.slice().sort((x, y) => (x.startTime ?? '99:99').localeCompare(y.startTime ?? '99:99')).slice(0, 3).map((task) => ({
        task, title: task.title, priority: task.priority || 'Medium', time: task.startTime ? formatPlannerTime(task.startTime) : '', tone: (task.priority || 'Medium').toLowerCase()
      }))
    : fallback.map((item) => ({ ...item, task: null as Task | null }));
  return <div className="space-y-4">
    <section><div className="mb-2 flex items-end justify-between"><h2 className="text-[22px] font-black">Tasks</h2><span className="text-sm font-bold text-[#5B21B6]">See all</span></div>
      <div className="space-y-2.5">{rows.map((item, i) => {
        const tone = item.tone === 'high' ? 'bg-red-100 text-red-600' : item.tone === 'low' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-600';
        return <div key={item.task?.id ?? i} className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:bg-card">
          <button type="button" onClick={() => item.task && onToggle(item.task)}>{item.task?.completed ? <span className="grid h-7 w-7 place-items-center rounded-full bg-[#8B5CF6] text-white"><Check className="h-4 w-4" /></span> : <Circle className="h-7 w-7 text-slate-300" />}</button>
          <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-bold">{item.title}</p></div>
          <div className="flex shrink-0 flex-col items-end gap-1"><span className={cn("rounded-md px-2 py-1 text-[11px] font-bold", tone)}>{item.priority}</span><span className="flex items-center gap-1 text-[11px] text-slate-500"><Clock3 className="h-3 w-3" />{item.time}</span></div>
        </div>;
      })}</div>
    </section>
    <section><h2 className="text-[22px] font-black">Goals</h2><p className="mb-2 text-[13px] text-slate-500">Your deadline, under control • 30-day mission</p><div className="space-y-2.5">
      <GoalReferenceCard title="Goal 1 • Crack PET Prelims" value="60%" sub="Deadline • 30 days remaining • 12/20 task done" progress={60} icon={<Target className="h-5 w-5" />} />
      <GoalReferenceCard title="Goal 2 • Daily 2hr Focus" value="3/7 days" sub="Consistency • 3 days in a row" progress={40} icon={<Clock3 className="h-5 w-5" />} orange />
    </div></section>
    <section><div className="flex items-center justify-between"><h2 className="text-[22px] font-black">Habits <Sparkles className="inline h-5 w-5" /></h2><span className="text-[11px] font-semibold text-muted-foreground">{habits.length} active</span></div><div className="mt-2 rounded-2xl bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:bg-card"><div className="grid grid-cols-3 gap-2">
      {habits.length === 0 ? <div className="col-span-3 py-6 text-center"><p className="text-sm font-semibold">No habits yet</p><p className="mt-1 text-[11px] text-muted-foreground">Habits tab se habit add karo — yahan real-time dikhegi.</p></div> : habits.slice(0, 3).map((item) => <LiveHabitReferenceCard key={item.habit.id} data={item} onToggle={() => onToggleHabit(item.habit.id, !item.completedToday)} />)}
    </div></div></section>
    <section className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:bg-card"><div><h2 className="text-[19px] font-black">Your Day Command Center</h2><p className="mt-1 text-sm text-slate-500">Stats • Focus today</p></div><div className="text-center"><div className="grid h-16 w-16 place-items-center rounded-full border-[5px] border-slate-200 text-xl font-black">0%</div><p className="mt-1 text-[11px] text-slate-500">Overall progress</p></div></section>
  </div>;
}
function formatPlannerTime(value: string) { const [h, m] = value.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; }
function GoalReferenceCard({ title, value, sub, progress, icon, orange = false }: { title: string; value: string; sub: string; progress: number; icon: ReactNode; orange?: boolean }) {
  return <div className="rounded-xl bg-white px-3 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:bg-card"><div className="flex items-center gap-3"><span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", orange ? "bg-orange-100 text-orange-500" : "bg-violet-100 text-violet-600")}>{icon}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-[15px] font-black">{title}</p><span className={cn("shrink-0 text-xl font-black", orange ? "text-slate-900 dark:text-foreground" : "text-violet-700")}>{value}</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200"><div className={cn("h-full rounded-full", orange ? "bg-orange-400" : "bg-gradient-to-r from-violet-600 to-fuchsia-500")} style={{ width: `${progress}%` }} /></div><p className="mt-1 text-[11px] text-slate-500">{sub}</p></div></div></div>;
}
function LiveHabitReferenceCard({ data, onToggle }: { data: HabitProgress; onToggle: () => void }) {
  const { habit, streak, completedToday, last30Days } = data;
  const Icon = habitIcon(habit.icon);
  const tone = habit.color || '#8b5cf6';
  const days = last30Days.slice(-7);
  return <button type="button" onClick={onToggle} className="min-w-0 rounded-xl px-2 py-2.5 text-center transition-transform active:scale-[.97]" style={{ background: `${tone}22`, border: `1px solid ${tone}33` }}>
    <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${tone}, #ec4899)` }}><Icon className="h-5 w-5" /></span>
    <p className="mt-1 truncate text-sm font-black">{habit.title}</p>
    <p className="text-[10px] text-muted-foreground">{streak} day{streak === 1 ? '' : 's'} streak</p>
    <div className="mt-2 grid grid-cols-7 gap-0.5">{days.map((day) => <span key={day.dateMs} className={cn("h-3.5 w-3.5 rounded-full", day.completed ? "text-white" : "bg-muted")} style={day.completed ? { backgroundColor: tone } : undefined}>{day.completed && <Check className="mx-auto h-3.5 w-3.5" />}</span>)}</div>
    <div className={cn("mt-2 rounded-full px-2 py-1 text-[10px] font-bold", completedToday ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "bg-muted text-muted-foreground")}>{completedToday ? '✓ Done today' : 'Tap to complete'}</div>
  </button>;
}

function habitIcon(name: string): ElementType {
  const icons: Record<string, ElementType> = { BookOpen, Droplet, Dumbbell, Moon, Brain, Sparkles, Flame, ListTodo };
  return icons[name] || Sparkles;
}

function HabitReferenceCard({ tone, icon, title, sub, checked }: { tone: 'orange' | 'blue' | 'green'; icon: ReactNode; title: string; sub: string; checked: boolean[] }) {
  const bg = tone === 'orange' ? 'bg-orange-200' : tone === 'blue' ? 'bg-blue-200' : 'bg-green-200';
  return <div className={cn("rounded-xl px-2 py-2.5 text-center", bg)}><div className="mx-auto grid w-fit place-items-center">{icon}</div><p className="mt-1 text-sm font-black">{title}</p><p className="text-[11px] text-slate-700">{sub}</p><div className="mt-2 grid grid-cols-7 gap-0.5">{checked.map((yes, i) => <span key={i} className="grid place-items-center"><span className={cn("grid h-4 w-4 place-items-center rounded-full", yes ? "bg-[#8B5CF6] text-white" : "border-2 border-slate-300 bg-white/70")}>{yes && <Check className="h-2.5 w-2.5" />}</span></span>)}</div><div className="mt-0.5 grid grid-cols-7 text-[8px] text-slate-700"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div>;
}
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
