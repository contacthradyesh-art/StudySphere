'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Flame, Sparkles, Mic2, PenTool, BarChart3 } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { subscribeWritingSessions, subscribeSpeakingSessions } from '@/lib/english-lab/english-lab-service';
import { subscribeEnglishLessonProgress, type EnglishLessonProgress } from '@/lib/english-lab/english-lesson-progress-service';
import type { WritingSession, SpeakingSession } from '@/lib/english-lab/english-lab-schema';

type VocabProgress = { learnedAt?: number; createdAt?: number };

function dayKey(value: number) {
  return new Date(value).toLocaleDateString('en-CA');
}

function calculateStreak(values: number[]) {
  const days = [...new Set(values.filter(Boolean).map(dayKey))].sort().reverse();
  if (!days.length) return null;
  let streak = 1;
  for (let i = 1; i < days.length; i += 1) {
    const previous = new Date(days[i - 1] + 'T00:00:00');
    const current = new Date(days[i] + 'T00:00:00');
    const diff = Math.round((previous.getTime() - current.getTime()) / 86400000);
    if (diff !== 1) break;
    streak += 1;
  }
  return streak;
}

export default function EnglishLabLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<EnglishLessonProgress[]>([]);
  const [vocabProgress, setVocabProgress] = useState<VocabProgress[]>([]);
  const [writing, setWriting] = useState<WritingSession[]>([]);
  const [speaking, setSpeaking] = useState<SpeakingSession[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubLessons = subscribeEnglishLessonProgress(user.uid, setLessons);
    const unsubWriting = subscribeWritingSessions(user.uid, setWriting);
    const unsubSpeaking = subscribeSpeakingSessions(user.uid, setSpeaking);
    const vocabRef = collection(db, COLLECTIONS.users, user.uid, 'vocabProgress');
    const unsubVocab = onSnapshot(vocabRef, (snap) => {
      setVocabProgress(snap.docs.map((item) => item.data() as VocabProgress));
    }, () => setVocabProgress([]));
    return () => {
      unsubLessons();
      unsubWriting();
      unsubSpeaking();
      unsubVocab();
    };
  }, [user]);

  const streak = useMemo(() => calculateStreak([
    ...lessons.map((x) => x.completedAt),
    ...vocabProgress.map((x) => x.learnedAt ?? x.createdAt ?? 0),
    ...writing.map((x) => x.createdAt),
    ...speaking.map((x) => x.createdAt),
  ]), [lessons, vocabProgress, writing, speaking]);

  const stats = [
    { label: 'Lessons completed', value: lessons.length ? String(lessons.length) : '—', icon: BookOpen },
    { label: 'Words learned', value: vocabProgress.length ? String(vocabProgress.length) : '—', icon: Sparkles },
    { label: 'Writing + speaking', value: writing.length || speaking.length ? String(writing.length + speaking.length) : '—', icon: PenTool },
    { label: 'Streak', value: streak ? String(streak) + ' day' + (streak === 1 ? '' : 's') : '—', icon: Flame },
  ];

  return (
    <div className="space-y-4">
      <GlassCard className="relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.10] via-background to-transparent p-4 sm:p-5">
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              <BarChart3 className="h-3.5 w-3.5" /> English Lab
            </div>
            <h1 className="mt-1 text-xl font-black tracking-tight">Learn • Practice • Improve</h1>
            <p className="mt-1 text-xs text-muted-foreground">Aapki real progress yahin track hoti hai.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/english-lab/library"><Button size="sm" variant="gradient"><BookOpen className="h-4 w-4" /> Library</Button></Link>
            <Link href="/dashboard/english-lab"><Button size="sm" variant="outline"><Mic2 className="h-4 w-4" /> Practice</Button></Link>
          </div>
        </div>
        <div className="relative mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <Icon className="h-3.5 w-3.5 text-primary" />
              <p className="mt-1 text-lg font-black">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </GlassCard>
      {children}
    </div>
  );
}
