'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Check, Flame, GraduationCap, NotebookPen, Sparkles, Timer, Users, Target, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { useTasksSync } from '@/hooks/use-tasks';
import { usePlannerInsights } from '@/hooks/use-planner-insights';
import { toggleTask } from '@/lib/planner/task-service';
import { awardXp } from '@/lib/gamification/xp-service';
import { formatDuration } from '@/utils/formatters';
import type { Task } from '@/lib/firestore/planner-schema';


export default function DashboardPage() {
  useTasksSync();
  const { user } = useAuth();
  const insights = usePlannerInsights();
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.displayName?.trim().split(/\s+/)[0] || 'Student';
  const tasks = insights.tasksToday;
  const completedToday = tasks.filter((t) => t.completed).length;
  const pendingToday = useMemo(() => tasks.filter((t) => !t.completed).slice(0, 5), [tasks]);
  const studySeconds = insights.dashboardStats.dailySeconds;
  const streak = insights.dashboardStats.streakDays;
  const { level } = insights.gamification;
  const progress = Math.round((level.progress || 0) * 100);
  const taskProgress = tasks.length ? Math.round((completedToday / tasks.length) * 100) : 0;
  const overall = Math.max(progress, taskProgress);
  async function handleToggleTask(task: Task) {
    if (!requireAuth(user)) return;
    setBusyTaskId(task.id);
    try { await toggleTask(user.uid, task.id, true); void awardXp(user.uid, 'completeTask'); toast.success('Task completed'); }
    catch { toast.error('Could not update task'); } finally { setBusyTaskId(null); }
  }
  return (
    <div className='min-w-0 space-y-8 pb-6'>
      <header className='flex items-start justify-between gap-4'>
        <div><p className='text-xs font-semibold tracking-wide text-muted-foreground'>TODAY</p>
          <h1 className='mt-1 text-3xl font-black sm:text-4xl'>{greeting}, {firstName} 👋</h1>
          <p className='mt-2 text-sm text-muted-foreground'>Let’s make today’s study count.</p></div>
        <Link href='/dashboard/community/profile' aria-label='Open profile' className='ss-press grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-white shadow-lg shadow-primary/20'>{(user?.displayName?.[0] || 'S').toUpperCase()}</Link>
      </header>
      <section className='ss-surface p-5 sm:p-6'>
        <div className='flex flex-wrap items-end justify-between gap-5'><div>
          <p className='text-xs font-bold tracking-wide text-primary'>TODAY&apos;S MISSION</p>
          <h2 className='mt-1 text-2xl font-black'>Study. Focus. Progress.</h2>
          <p className='mt-1 text-sm text-muted-foreground'>Your personal command center.</p></div>
          <Link href='/dashboard/planner' className='ss-press inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20'>View plan <ArrowRight className='h-4 w-4' /></Link>
        </div>
        <div className='mt-5 h-2 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-gradient-brand transition-all duration-500' style={{width: `${overall}%`}} /></div>
        <div className='mt-4 grid grid-cols-3 gap-3 sm:gap-6'><Metric icon={Sparkles} label='Progress' value={`${overall}%`} /><Metric icon={Timer} label='Focus time' value={formatDuration(studySeconds)} /><Metric icon={CalendarDays} label='Tasks' value={`${completedToday}/${tasks.length}`} /></div>
      </section>
      <section><div className='mb-3 flex items-end justify-between'><div><p className='text-xs font-semibold text-muted-foreground'>NEXT UP</p><h2 className='mt-1 text-xl font-bold'>Today’s plan</h2></div><Link href='/dashboard/planner' className='text-sm font-semibold text-primary'>Open Planner</Link></div>
        {pendingToday.length === 0 ? <div className='ss-surface p-7 text-center'><Check className='mx-auto h-7 w-7 text-emerald-400' /><p className='mt-2 font-semibold'>Your planned tasks are complete.</p><p className='mt-1 text-xs text-muted-foreground'>Nice work. Add another block when you’re ready.</p></div> :
          <div className='space-y-2'>{pendingToday.map((task) => <button key={task.id} disabled={busyTaskId === task.id} onClick={() => void handleToggleTask(task)} className='ss-press flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/60'><span className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-[11px] font-bold text-primary'>{task.startTime || '•'}</span><span className='min-w-0 flex-1'><b className='block truncate text-sm'>{task.title}</b><small className='mt-1 block truncate text-xs text-muted-foreground'>{task.subject || 'General study'}{task.endTime ? ` · ${task.endTime}` : ''}</small></span><Check className='h-4 w-4 shrink-0 text-muted-foreground' /></button>)}</div>}
      </section>
      <section><h2 className='mb-3 text-xl font-bold'>Quick actions</h2><div className='grid grid-cols-2 gap-3 sm:grid-cols-4'><Quick href='/dashboard/planner' icon={Target} title='Plan' subtitle='Organize today' /><Quick href='/dashboard/pomodoro' icon={Timer} title='Focus' subtitle='Start a session' /><Quick href='/dashboard/mock-tests' icon={GraduationCap} title='Mock Test' subtitle='Practice now' /><Quick href='/dashboard/notes' icon={NotebookPen} title='Notes' subtitle='Write or review' /></div></section>
      <section className='grid gap-3 sm:grid-cols-2'><div className='ss-surface p-4'><div className='flex items-center gap-3'><span className='grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary'><Flame className='h-5 w-5' /></span><div><p className='text-xs text-muted-foreground'>Study streak</p><p className='text-xl font-black'>{streak} days</p></div></div></div>
        <div className='ss-surface p-4'><div className='flex items-center gap-3'><span className='grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary'><Trophy className='h-5 w-5' /></span><div className='min-w-0 flex-1'><p className='text-xs text-muted-foreground'>Learning level</p><p className='font-bold'>Level {level.level} · {level.xpIntoLevel} XP</p></div><span className='text-sm font-bold'>{progress}%</span></div></div></section>
      <Link href='/dashboard/community' className='ss-press block rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10'><div className='flex items-center gap-3'><span className='grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary'><Users className='h-5 w-5' /></span><div className='min-w-0 flex-1'><p className='font-semibold'>Study Together</p><p className='text-xs text-muted-foreground'>Join a live room and focus with other students.</p></div><ArrowRight className='h-4 w-4 text-primary' /></div></Link>
    </div>
  );
}
function Metric({icon:Icon,label,value}:{icon:typeof Timer;label:string;value:string}){return <div><div className='flex items-center gap-2 text-xs text-muted-foreground'><Icon className='h-4 w-4 text-primary'/>{label}</div><p className='mt-1 text-lg font-black'>{value}</p></div>}
function Quick({href,icon:Icon,title,subtitle}:{href:string;icon:typeof Timer;title:string;subtitle:string}){return <Link href={href} className='ss-press ss-surface p-4 hover:border-primary/30'><span className='grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary'><Icon className='h-5 w-5'/></span><p className='mt-3 text-sm font-bold'>{title}</p><p className='mt-1 text-xs text-muted-foreground'>{subtitle}</p></Link>}