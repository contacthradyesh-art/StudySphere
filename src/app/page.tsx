import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import {
  GraduationCap, Calendar, Timer, BookOpen, Layers, NotebookPen,
  ShieldCheck, LineChart, MapPinned, ArrowRight
} from 'lucide-react';

const features = [
  { icon: Calendar, title: 'Smart Planner', desc: 'Weekly and monthly plans, goals, and habit tracking that adapt to how you actually study.' },
  { icon: Timer, title: 'Pomodoro + Focus Shield', desc: 'Timed focus sessions paired with a browser extension that blocks Shorts, Reels, and distracting sites while you work.' },
  { icon: NotebookPen, title: 'Notes & Digital Diary', desc: 'Markdown notes with attachments, plus a private, mood-tracked journal for reflection.' },
  { icon: Layers, title: 'Flashcards (SM-2)', desc: 'Spaced-repetition flashcards so revision happens right before you would otherwise forget.' },
  { icon: BookOpen, title: 'AI Study Assistant', desc: 'Ask questions, summarize topics, and generate study material on demand.' },
  { icon: MapPinned, title: 'Mission IAS', desc: 'A dedicated UPSC prep track: daily current affairs, map practice, digital library, and more.' },
  { icon: LineChart, title: 'Analytics', desc: 'Accuracy, retention, and study-time trends pulled from your real test and session history.' },
  { icon: ShieldCheck, title: 'Gamification', desc: 'XP, streaks, and achievements that track actual completed sessions and tasks.' },
];

const steps = [
  { step: '01', title: 'Create your account', desc: 'Sign up free — your data stays private to your account.' },
  { step: '02', title: 'Set up your plan', desc: 'Add subjects, goals, and a weekly schedule in the Planner.' },
  { step: '03', title: 'Study with the tools', desc: 'Run focus sessions, take notes, review flashcards, and track progress as you go.' },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-2 font-bold">
          <GraduationCap className="h-6 w-6 text-primary" /> StudySphere
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost"><Link href="/login">Log in</Link></Button>
          <Button asChild variant="gradient"><Link href="/register">Get started</Link></Button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Study smarter with <span className="text-gradient">StudySphere</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          The all-in-one AI productivity platform: planner, Pomodoro, notes, flashcards,
          journal and exam prep, beautifully unified.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Button asChild size="lg" variant="gradient"><Link href="/register">Start free</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/login">I have an account</Link></Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything in one place</h2>
          <p className="mt-3 text-muted-foreground">No separate apps for planning, focus, notes, and revision.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm transition-colors hover:border-primary/40">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map(({ step, title, desc }) => (
            <div key={step}>
              <span className="text-sm font-bold text-primary">{step}</span>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Ready to start?</h2>
        <p className="mt-3 text-muted-foreground">Free to use. Set up your first plan in a couple of minutes.</p>
        <Button asChild size="lg" variant="gradient" className="mt-8">
          <Link href="/register">Create your account <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </section>

      <footer className="mx-auto max-w-6xl border-t border-border/60 px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="flex items-center gap-2 text-sm font-medium">
            <GraduationCap className="h-4 w-4 text-primary" /> StudySphere
          </span>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} StudySphere. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
