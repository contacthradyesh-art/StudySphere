import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import {
  ArrowRight, ArrowUpRight, BookOpen, BrainCircuit, CalendarDays, Check,
  GraduationCap, Layers3, LineChart, ShieldCheck, Sparkles, Target, Timer,
  Trophy, Users, Zap,
} from 'lucide-react';

const paths = [
  { name: 'School students', detail: 'Build strong foundations, stay on top of homework and revise with confidence.', tag: 'Classes 6–12', icon: GraduationCap, href: '/register' },
  { name: 'College students', detail: 'Manage semesters, assignments, notes and exam preparation in one workspace.', tag: 'UG · PG', icon: BookOpen, href: '/register' },
  { name: 'Competitive exams', detail: 'Turn a big syllabus into a focused plan with practice, revision and progress tracking.', tag: 'SSC · UPSC · Banking', icon: Target, href: '/register' },
];

const pillars = [
  { icon: CalendarDays, title: 'A plan you can follow', text: 'Turn goals and syllabus into daily tasks. See what matters today and keep moving.' },
  { icon: Timer, title: 'Deep-focus sessions', text: 'Use Pomodoro sessions and Focus Shield to protect the time you set aside to study.' },
  { icon: Layers3, title: 'Remember what you learn', text: 'Keep notes, make flashcards and return to important concepts with spaced revision.' },
  { icon: BrainCircuit, title: 'AI study support', text: 'Get explanations, summaries and study material when you need a clearer way forward.' },
  { icon: LineChart, title: 'Progress that means something', text: 'Track completed work, focus time, test performance and consistency over time.' },
  { icon: Users, title: 'Study with others', text: 'Join study rooms, stay accountable and make focused learning feel less lonely.' },
];

const steps = [
  { n: '01', title: 'Choose your learning path', text: 'Tell StudySphere what you are studying and what you want to achieve.' },
  { n: '02', title: 'Make today actionable', text: 'Break your target into clear tasks, subjects and manageable focus blocks.' },
  { n: '03', title: 'Learn, review, improve', text: 'Study with focus, revise on time and use your progress to plan what comes next.' },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/.17),transparent_65%)]" />
      <div className="pointer-events-none absolute -left-40 top-[420px] -z-10 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-[720px] -z-10 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-brand text-white shadow-lg shadow-primary/25"><GraduationCap className="h-6 w-6" /></span>
          <span><span className="block text-base font-black tracking-tight">StudySphere</span><span className="block text-[10px] font-semibold tracking-[.2em] text-muted-foreground">YOUR LEARNING OS</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#paths" className="transition-colors hover:text-foreground">Who it’s for</a>
          <a href="#tools" className="transition-colors hover:text-foreground">Study tools</a>
          <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm"><Link href="/login">Log in</Link></Button>
          <Button asChild variant="gradient" size="sm" className="hidden sm:inline-flex"><Link href="/register">Get started <ArrowUpRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:pb-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> One workspace. Better learning.</div>
          <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[1.06] tracking-[-.045em] sm:text-6xl lg:text-[4.25rem]">Your goals deserve a <span className="text-gradient">better system.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Plan your study, protect your focus, understand difficult topics and see your progress — all in one calm, connected learning space.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="gradient" className="h-12 px-6"><Link href="/register">Build my study system <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6"><Link href="/login">Continue learning</Link></Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Personal study workspace</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Built for every learning path</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-pink-500/15 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 p-4 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div><p className="text-xs font-semibold text-muted-foreground">YOUR STUDY SPACE</p><p className="mt-1 text-lg font-black">Today, made simpler.</p></div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">READY TO FOCUS</span>
            </div>
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white shadow-lg shadow-violet-900/20">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-white/75">DAILY PROGRESS</span><Zap className="h-4 w-4 text-amber-300" /></div>
              <div className="mt-2 flex items-end justify-between"><p className="text-4xl font-black tracking-tight">Make it count.</p><span className="text-xs text-white/70">One step at a time</span></div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[68%] rounded-full bg-white" /></div>
              <p className="mt-2 text-[11px] text-white/75">A clear plan turns effort into momentum.</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-background/80 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="h-4 w-4" /></span><p className="mt-3 text-sm font-bold">Smart Planner</p><p className="mt-1 text-xs text-muted-foreground">Know your next step</p></div>
              <div className="rounded-2xl border border-border bg-background/80 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500"><Timer className="h-4 w-4" /></span><p className="mt-3 text-sm font-bold">Focus Mode</p><p className="mt-1 text-xs text-muted-foreground">Protect your attention</p></div>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-background/80 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500"><Trophy className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold">Small wins add up</p><p className="mt-0.5 text-xs text-muted-foreground">Build consistency, not pressure.</p></div><ArrowUpRight className="h-4 w-4 text-muted-foreground" /></div>
          </div>
          <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:flex"><span className="grid h-8 w-8 place-items-center rounded-xl bg-pink-500/10 text-pink-500"><ShieldCheck className="h-4 w-4" /></span><span className="text-xs font-bold">Your focus, protected</span></div>
        </div>
      </section>

      <section id="paths" className="border-y border-border/70 bg-card/35 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl"><p className="text-xs font-bold tracking-[.18em] text-primary">MADE FOR YOUR JOURNEY</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Different goals. <span className="text-gradient">One place to grow.</span></h2><p className="mt-3 text-muted-foreground">Whether you are learning for school, college or a competitive exam, your workspace should fit the way you study.</p></div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {paths.map(({ name, detail, tag, icon: Icon, href }) => <Link key={name} href={href} className="group rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></span><ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" /></div><p className="mt-6 text-xl font-black">{name}</p><p className="mt-2 min-h-[3.5rem] text-sm leading-6 text-muted-foreground">{detail}</p><span className="mt-5 inline-flex rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground">{tag}</span></Link>)}
          </div>
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold tracking-[.18em] text-primary">THE ESSENTIALS, CONNECTED</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Everything works toward <span className="text-gradient">one goal: progress.</span></h2><p className="mt-3 text-muted-foreground">Fewer disconnected tools. A more intentional way to learn every day.</p></div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-3xl border border-border/80 bg-card/60 p-6 transition-colors hover:border-primary/30"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}
        </div>
      </section>

      <section id="how" className="border-y border-border/70 bg-card/35 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><p className="text-xs font-bold tracking-[.18em] text-primary">A SIMPLE SYSTEM</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Make your next study session easier to start.</h2><p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">You do not need a perfect routine. You need a clear next step and a place that helps you follow through.</p><Button asChild variant="gradient" className="mt-7"><Link href="/register">Start your workspace <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
            <div className="space-y-4">{steps.map(({ n, title, text }) => <div key={n} className="flex gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6"><span className="pt-1 text-sm font-black tracking-widest text-primary">{n}</span><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></div>)}</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 sm:py-24"><div className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-pink-500/5 px-6 py-12 sm:px-12"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="h-6 w-6" /></span><h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Your next chapter starts with one focused step.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Create your free workspace, choose your learning path and make a plan you can actually follow.</p><Button asChild size="lg" variant="gradient" className="mt-7 h-12 px-6"><Link href="/register">Create my StudySphere account <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></section>

      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-border/70 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:px-8"><Link href="/" className="flex items-center gap-2 font-bold text-foreground"><GraduationCap className="h-4 w-4 text-primary" /> StudySphere</Link><p>Built to make learning more focused, organised and human.</p><div className="flex gap-4"><Link href="/login" className="hover:text-foreground">Log in</Link><Link href="/register" className="hover:text-foreground">Create account</Link></div></footer>
    </main>
  );
}
