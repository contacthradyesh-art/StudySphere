'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  GraduationCap, ShieldCheck, BookOpen, BookHeart, Layers, Sparkles,
  MoreHorizontal, X, Landmark, Languages, CalendarDays, Timer,
  Library, Bookmark, BarChart3, Settings, Target
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
    ],
  },
  {
    title: 'Resources',
    items: [
      { href: '/dashboard/mission-ias/digital-library', label: 'Digital Library', icon: Library },
      { href: '/dashboard/mission-ias/bookmarks', label: 'Bookmarks', icon: Bookmark },
      { href: '/dashboard/mission-ias/reports-indices', label: 'Reports', icon: BarChart3 },
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
          <div className="safe-bottom absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto rounded-t-[26px] border-t border-white/10 bg-background p-4 pb-8 shadow-2xl">
            <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-background pb-2">
              <div><h3 className="text-lg font-semibold">More</h3><p className="text-xs text-muted-foreground">Everything else in StudySphere</p></div>
              <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-5">
              {SECTIONS.map((section) => (
                <section key={section.title}>
                  <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{section.title}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map(({ href, label, icon: Icon }) => {
                      const active = pathname === href || pathname.startsWith(href + '/');
                      return (
                        <Link key={href} href={href} onClick={() => setOpen(false)} className={cn('flex min-h-12 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors', active ? 'border-primary/30 bg-primary/10 text-primary' : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05] hover:text-foreground')}>
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{label}</span>
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
