'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  GraduationCap, ShieldCheck, BookOpen, BookHeart, Layers, Sparkles,
  MoreHorizontal, X, Landmark, Languages, CalendarDays, Timer,
  Library, Bookmark, BarChart3, Settings, Target, FileText, Newspaper,
  PenLine, Brain, Map, Mic2, History, ClipboardCheck, TrendingUp,
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'Study',
    items: [
      { href: '/dashboard/mission-ias', label: 'Mission IAS', icon: Landmark },
      { href: '/dashboard/mock-tests', label: 'Mock Tests', icon: GraduationCap },
      { href: '/dashboard/subjects', label: 'Subjects', icon: BookOpen },
      { href: '/dashboard/syllabus', label: 'Syllabus', icon: BookOpen },
      { href: '/dashboard/flashcards', label: 'Flashcards', icon: Layers },
      { href: '/dashboard/ai', label: 'AI Doubt Solver', icon: Sparkles },
      { href: '/dashboard/english-lab', label: 'English Lab', icon: Languages },
      { href: '/dashboard/mission-ias/current-affairs', label: 'Current Affairs', icon: Newspaper },
      { href: '/dashboard/mission-ias/answer-writing', label: 'Answer Writing', icon: PenLine },
      { href: '/dashboard/mission-ias/pyq-intelligence', label: 'PYQ Intelligence', icon: Brain },
      { href: '/dashboard/mission-ias/map-practice', label: 'Map Practice', icon: Map },
      { href: '/dashboard/mission-ias/interview', label: 'Interview Prep', icon: Mic2 },
    ],
  },
  {
    title: 'Productivity',
    items: [
      { href: '/dashboard/planner', label: 'Life Planner', icon: CalendarDays },
      { href: '/dashboard/focus', label: 'Focus Shield', icon: ShieldCheck },
      { href: '/dashboard/pomodoro', label: 'Pomodoro', icon: Timer },
      { href: '/dashboard/journal', label: 'Journal', icon: BookHeart },
      { href: '/dashboard/achievements', label: 'Achievements', icon: Target },
      { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
    ],
  },
  {
    title: 'Resources',
    items: [
      { href: '/dashboard/mission-ias/digital-library', label: 'Digital Library', icon: Library },
      { href: '/dashboard/mission-ias/bookmarks', label: 'Bookmarks', icon: Bookmark },
      { href: '/dashboard/mission-ias/reports-indices', label: 'Reports', icon: BarChart3 },
      { href: '/dashboard/mission-ias/revision', label: 'Revision Hub', icon: History },
      { href: '/dashboard/mission-ias/tests', label: 'Test History', icon: ClipboardCheck },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function MoreSheet() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button onClick={() => setOpen(true)} className={cn('flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors', open ? 'text-primary' : 'text-muted-foreground')} aria-label="Open more menu">
        <MoreHorizontal className="h-5 w-5" />
        More
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="safe-bottom absolute bottom-0 left-0 right-0 max-h-[86vh] overflow-y-auto rounded-t-[26px] border-t border-border bg-background p-4 pb-8 shadow-2xl">
            <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-background pb-2">
              <div><h3 className="text-lg font-semibold">More</h3><p className="text-xs text-muted-foreground">Everything else in StudySphere</p></div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-xl p-2 hover:bg-muted"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-6">
              {SECTIONS.map((section) => (
                <section key={section.title}>
                  <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{section.title}</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {section.items.map(({ href, label, icon: Icon }) => {
                      const active = pathname === href || pathname.startsWith(href + '/');
                      return (
                        <Link key={href} href={href} onClick={() => setOpen(false)} className={cn('group flex min-h-14 items-center gap-3 rounded-2xl border px-3 py-3 text-left text-xs font-medium transition-all duration-200', active ? 'border-primary/40 bg-primary/10 text-primary shadow-sm' : 'border-border bg-card/60 text-foreground hover:bg-muted hover:border-primary/20')}>
                          <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted/70', active && 'bg-primary/15')}><Icon className="h-4 w-4" /></span>
                          <span className="min-w-0 truncate">{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
