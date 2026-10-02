'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarCheck, Timer, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MoreSheet } from '@/components/layout/more-sheet';

const BOTTOM_NAV = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/community', label: 'Together', icon: Users },
  { href: '/dashboard/planner', label: 'Planner', icon: CalendarCheck },
  { href: '/dashboard/pomodoro', label: 'Focus', icon: Timer },
  { href: '/dashboard/notes', label: 'Notes', icon: StickyNote },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] border-t border-border bg-background/95 shadow-[0_-8px_24px_rgba(0,0,0,.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex h-[70px] max-w-xl items-stretch px-1.5">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
          return (
            <Link key={href} href={href} className={cn('ss-press relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold', active ? 'text-primary' : 'text-muted-foreground')}>
              <span className={cn('grid h-9 w-9 place-items-center rounded-xl transition-colors', active ? 'bg-primary/12' : 'bg-transparent')}>
                <Icon className={cn('h-[19px] w-[19px]', active && 'drop-shadow-[0_0_7px_rgba(139,92,246,.45)]')} />
              </span>
              <span>{label}</span>
              {active && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,.8)]" />}
            </Link>
          );
        })}
        <MoreSheet />
      </div>
    </nav>
  );
}