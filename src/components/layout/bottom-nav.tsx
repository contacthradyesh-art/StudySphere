'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarCheck, Timer, NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MoreSheet } from './more-sheet';

const BOTTOM_NAV = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/planner', label: 'Planner', icon: CalendarCheck },
  { href: '/dashboard/pomodoro', label: 'Focus', icon: Timer },
  { href: '/dashboard/notes', label: 'Notes', icon: NotebookPen },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-white/10 bg-background/80 backdrop-blur-xl md:hidden">
      {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
            {label}
            {active && <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-primary" />}
          </Link>
        );
      })}
      <MoreSheet />
    </nav>
  );
}