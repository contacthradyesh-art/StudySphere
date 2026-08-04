'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Flame, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { useTasksSync } from '@/hooks/use-tasks';
import { usePlannerInsights } from '@/hooks/use-planner-insights';
import { toggleTask } from '@/lib/planner/task-service';
import { awardXp } from '@/lib/gamification/xp-service';
import { formatDuration } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/firestore/planner-schema';

const TOOLS = [
  { icon: '\ud83d\udcc5', title: 'Life Planner', desc: 'Tasks, goals, and your daily mission.', link: '/dashboard/planner', color: '#8b5cf6' },
  { icon: '\ud83c\udfaf', title: 'Focus Shield', desc: 'Deep work timer, distractions blocked.', link: '/dashboard/focus', color: '#ec4899' },
  { icon: '\ud83d\udcdd', title: 'Mock Tests', desc: 'Timed tests with instant analysis.', link: '/dashboard/mock-tests', color: '#22c55e' },
  { icon: '\ud83c\udccf', title: 'Flashcards', desc: 'Spaced-repetition revision.', link: '/dashboard/flashcards', color: '#06b6d4' },
  { icon: '\ud83e\udd16', title: 'AI Doubt Solver', desc: 'Ask anything, get a real answer.', link: '/dashboard/ai', color: '#a855f7' },
  { icon: '\ud83c\udff0', title: 'Mission IAS', desc: 'UPSC current affairs & vocabulary.', link: '/dashboard/mission-ias', color: '#f97316' },
  { icon: '\u2694\ufe0f', title: 'Bushido', desc: 'Discipline system for daily grind.', link: '/dashboard/bushido', color: '#ef4444' },
  { icon: '\ud83d\udcd2', title: 'Notes', desc: 'Everything you\u2019ve captured.', link: '/dashboard/notes', color: '#eab308' }
];

function ProgressRing({ progress, size = 116 }: { progress: number; size?: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} stroke="url(#ring-gradient)" strokeWidth={stroke} fill="none"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - clamped)}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function DashboardPage() {
  useTasksSync();
  const router = useRouter();
  const { user } = useAuth();
  const insights = usePlannerInsights();
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  const DAILY_GOAL_SECONDS = 4 * 60 * 60;
  const studySeconds = insights.dashboardStats.dailySeconds;
  const ringProgress = studySeconds / DAILY_GOAL_SECONDS;
  const streak = insights.dashboardStats.streakDays;
  const { level, badges } = insights.gamification;

  const pendingToday = useMemo(
    () => insights.tasksToday.filter((t) => !t.completed).slice(0, 4),
    [insights.tasksToday]
  );

  const primaryAction = useMemo(() => {
    if (pendingToday.length > 0) return { label: `Continue today's mission`, sub: `${pendingToday.length} task${pendingToday.length > 1 ? 's' : ''} left`, href: '/dashboard/planner' };
    if (studySeconds === 0) return { label: 'Start a focus session', sub: 'Nothing logged yet today', href: '/dashboard/focus' };
    return { label: 'Keep the streak going', sub: 'Great work today \u2014 review or get ahead', href: '/dashboard/planner' };
  }, [pendingToday.length, studySeconds]);

  async function handleToggleTask(task: Task) {
    if (!requireAuth(user)) return;
    setBusyTaskId(task.id);
    try {
      await toggleTask(user.uid, task.id, true);
      void awardXp(user.uid, 'completeTask');
      toast.success('Nice \u2014 marked done');
    } catch {
      toast.error('Could not update task');
    } finally {
      setBusyTaskId(null);
    }
  }

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-charcoal-900 via-charcoal-900 to-primary/10 p-5 sm:p-7">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm text-charcoal-400">{greeting},</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{firstName} \ud83d\udc4b</h1>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-charcoal-300 sm:justify-start">
              <Flame className={cn('h-4 w-4', streak > 0 ? 'text-orange-400' : 'text-charcoal-600')} />
              <span>{streak > 0 ? `${streak} day streak` : 'Start your streak today'}</span>
              <span className="text-charcoal-600">\u2022</span>
              <span>Level {level.level}</span>
            </div>

            <button
              onClick={() => router.push(primaryAction.href)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
            >
              {primaryAction.label} <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-1 text-xs text-charcoal-500">{primaryAction.sub}</p>
          </div>

          <div className="relative flex shrink-0 items-center justify-center">
            <ProgressRing progress={ringProgress} />
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-bold">{formatDuration(studySeconds)}</span>
              <span className="text-[10px] text-charcoal-400">of {formatDuration(DAILY_GOAL_SECONDS)} today</span>
            </div>
          </div>
        </div>
      </div>

      {pendingToday.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Today's mission</h2>
            <Link href="/dashboard/planner" className="text-xs text-primary hover:underline">View all \u2192</Link>
          </div>
          <div className="space-y-2">
            {pendingToday.map((t) => (
              <button
                key={t.id}
                onClick={() => handleToggleTask(t)}
                disabled={busyTaskId === t.id}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.06]"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-charcoal-600">
                  {busyTaskId === t.id && <Check className="h-3 w-3 animate-pulse text-primary" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
                {t.subject && <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-charcoal-400">{t.subject}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-base font-semibold">Jump back in</h2>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:px-0">
          {TOOLS.map((t) => (
            <Link
              key={t.title}
              href={t.link}
              className="group block w-40 shrink-0 snap-start rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-primary/40 hover:bg-white/[0.06]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: `${t.color}22` }}>
                {t.icon}
              </div>
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="mt-0.5 text-xs leading-snug text-charcoal-500">{t.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Level {level.level}</h2>
          </div>
          <Link href="/dashboard/achievements" className="text-xs text-primary hover:underline">All achievements \u2192</Link>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-brand transition-all duration-500" style={{ width: `${Math.round(level.progress * 100)}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-charcoal-500">{level.xpIntoLevel} / {level.xpIntoLevel + level.xpForNext} XP to Level {level.level + 1}</p>

        {badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.slice(0, 6).map((b) => (
              <div key={b.id} title={b.description} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                <span>{b.emoji}</span> {b.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
