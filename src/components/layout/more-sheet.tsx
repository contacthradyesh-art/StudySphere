'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  GraduationCap, Rocket, ShieldCheck, BookOpen, BookHeart,
  Layers, Sparkles, LayoutDashboard, MoreHorizontal, X, Landmark
} from 'lucide-react';

const MORE_NAV = [
  { href: '/dashboard/mock-tests', label: 'Mock Tests', icon: GraduationCap },
  { href: '/dashboard/mission-ias', label: 'Mission IAS', icon: Landmark },
  { href: '/dashboard/growth-os', label: 'Growth OS', icon: Rocket },
  { href: '/dashboard/focus', label: 'Focus Shield', icon: ShieldCheck },
  { href: '/dashboard/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/dashboard/journal', label: 'Journal', icon: BookHeart },
  { href: '/dashboard/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/dashboard/bushido', label: 'Bushido', icon: ShieldCheck },
  { href: '/dashboard/ai', label: 'AI Doubt Solver', icon: Sparkles },
  { href: '/dashboard/analytics', label: 'Analytics', icon: LayoutDashboard },
  { href: '/dashboard/syllabus', label: 'Syllabus', icon: BookOpen },
  { href: '/dashboard/wellbeing', label: 'Wellbeing', icon: BookHeart },
];

export function MoreSheet() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
          open ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <MoreHorizontal className="h-5 w-5" />
        More
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="safe-bottom absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-background p-4 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">More</h3>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {MORE_NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 px-2 py-4 text-center text-xs font-medium transition-colors',
                      active ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}