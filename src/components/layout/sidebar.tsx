'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, CalendarCheck, Timer, ShieldCheck, NotebookPen,
  BookOpen, Sparkles, GraduationCap, BookHeart, Layers, Landmark, Languages,
  Settings, Library, Trophy
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/planner', label: 'Life Planner', icon: CalendarCheck },
  { href: '/dashboard/mission-ias', label: 'Mission IAS', icon: Landmark },
  { href: '/dashboard/mission-ias/digital-library', label: 'Digital Library', icon: Library },
  { href: '/dashboard/mock-tests', label: 'Mock Tests', icon: GraduationCap },
  { href: '/dashboard/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/dashboard/syllabus', label: 'Syllabus', icon: BookOpen },
  { href: '/dashboard/english-lab', label: 'English Lab', icon: Languages },
  { href: '/dashboard/pomodoro', label: 'Pomodoro', icon: Timer },
  { href: '/dashboard/focus', label: 'Focus Shield', icon: ShieldCheck },
  { href: '/dashboard/notes', label: 'Notes', icon: NotebookPen },
  { href: '/dashboard/journal', label: 'Journal', icon: BookHeart },
  { href: '/dashboard/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/dashboard/ai', label: 'AI Doubt Solver', icon: Sparkles },
  { href: '/dashboard/achievements', label: 'Achievements', icon: Trophy },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-background/55 p-3 backdrop-blur-xl lg:flex">
      <Link href="/dashboard" className="mb-5 flex items-center gap-2 rounded-xl px-3 py-2 font-bold hover:bg-white/[0.04]">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10"><GraduationCap className="h-5 w-5 text-primary" /></span>
        <span>StudySphere</span>
      </Link>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-hide">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-gradient-brand text-white shadow-lg shadow-primary/15'
                  : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">StudySphere</p>
        <p className="mt-1 text-xs text-muted-foreground">Your study system, all in one place.</p>
      </div>
    </aside>
  );
}
