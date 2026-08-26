'use client';

import Link from 'next/link';
import { BrainCircuit, BookOpen, Flame, Headphones, Mic2, Sparkles, Target, Trophy, Volume2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';

const skills = [
  ['Vocabulary', 72, BrainCircuit],
  ['Grammar', 68, Target],
  ['Reading', 61, Headphones],
  ['Speaking', 54, Mic2],
] as const;

export default function EnglishLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <GlassCard className="relative overflow-hidden border-primary/20 bg-[radial-gradient(circle_at_85%_15%,hsl(var(--primary)/.24),transparent_35%),linear-gradient(135deg,hsl(var(--background)/.98),hsl(var(--primary)/.07))] p-5 sm:p-7">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary"><Sparkles className="h-4 w-4" /> English Performance OS</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Build English that performs under pressure.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Adaptive practice for grammar, vocabulary, reading, writing, speaking and pronunciation — built for exams, interviews and real communication.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">CEFR A1 → C2</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Exam Mode</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">AI Feedback</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Daily Practice</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/english-lab/library"><Button size="sm" variant="gradient"><BookOpen className="h-4 w-4" /> Open Master Library</Button></Link>
              <Link href="/dashboard/english-lab"><Button size="sm" variant="outline">Practice Lab</Button></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {skills.map(([name, value, Icon]) => <div key={name} className="rounded-2xl border border-white/10 bg-black/10 p-3 backdrop-blur">
              <Icon className="h-4 w-4 text-primary" />
              <div className="mt-3 flex items-end justify-between"><p className="text-lg font-black">{value}%</p><p className="text-[10px] text-muted-foreground">mastery</p></div>
              <p className="text-[11px] text-muted-foreground">{name}</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div>
            </div>)}
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-3">
        <GlassCard className="flex items-center gap-3 p-4"><div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-400"><Flame className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">Learning streak</p><p className="font-bold">7 days</p></div></GlassCard>
        <GlassCard className="flex items-center gap-3 p-4"><div className="rounded-xl bg-primary/10 p-2.5 text-primary"><Trophy className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">Current target</p><p className="font-bold">B1 → B2</p></div></GlassCard>
        <GlassCard className="flex items-center gap-3 p-4"><div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400"><Volume2 className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">Today's mission</p><p className="font-bold">20 min speaking</p></div></GlassCard>
      </div>

      <div className="[&>div>div:first-child]:hidden">{children}</div>
    </div>
  );
}
