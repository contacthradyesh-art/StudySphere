import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { GraduationCap } from 'lucide-react';

/** Public landing page. */
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

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
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
    </main>
  );
}
