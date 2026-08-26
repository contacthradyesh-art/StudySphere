'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, LogOut, Search, Settings, User as UserIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTasksSync } from '@/hooks/use-tasks';
import { usePlannerStore } from '@/store/planner-store';
import { signOut } from '@/lib/auth/service';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function Topbar() {
  useTasksSync();
  const { user } = useAuth();
  const tasks = usePlannerStore((s) => s.tasks);
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!notificationRef.current?.contains(target)) setNotificationsOpen(false);
      if (!profileRef.current?.contains(target)) setProfileOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        router.push('/dashboard/planner');
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  const today = todayKey();
  const pending = tasks.filter((task) => task.dueDate === today && !task.completed).slice(0, 5);
  const firstName = user?.displayName?.trim().split(/\s+/)[0] || 'Student';
  const initials = firstName.slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 min-w-0 items-center justify-between border-b border-white/[0.06] bg-background/85 px-3 backdrop-blur-xl sm:px-4 md:px-6">
      <button
        type="button"
        onClick={() => router.push('/dashboard/planner')}
        className="hidden min-w-0 max-w-xl flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-left md:flex"
        aria-label="Search StudySphere"
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm text-muted-foreground">Search tasks, goals, subjects...</span>
        <span className="ml-auto rounded border border-white/10 px-1.5 text-[10px] text-muted-foreground">Ctrl K</span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5 md:hidden" aria-label="Search planner" onClick={() => router.push('/dashboard/planner')}>
          <Search className="h-5 w-5" />
        </Button>

        <div className="relative" ref={notificationRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-xl hover:bg-white/5"
            aria-label={`${pending.length} pending notifications`}
            aria-expanded={notificationsOpen}
            onClick={() => { setNotificationsOpen((v) => !v); setProfileOpen(false); }}
          >
            <Bell className="h-5 w-5" />
            {pending.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />}
          </Button>
          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div><p className="text-sm font-semibold">Today</p><p className="text-[11px] text-muted-foreground">{pending.length ? `${pending.length} task${pending.length > 1 ? 's' : ''} waiting` : 'You are all caught up'}</p></div>
                <button type="button" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications" className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5"><X className="h-4 w-4" /></button>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {pending.length ? pending.map((task) => (
                  <button key={task.id} type="button" onClick={() => { setNotificationsOpen(false); router.push('/dashboard/planner'); }} className="flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-white/5">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Check className="h-4 w-4" /></span>
                    <span className="min-w-0"><b className="block truncate text-sm">{task.title}</b><small className="text-xs text-muted-foreground">{task.startTime || 'Today'}{task.subject ? ` · ${task.subject}` : ''}</small></span>
                  </button>
                )) : <div className="p-6 text-center text-sm text-muted-foreground">No pending tasks for today.</div>}
              </div>
              <button type="button" onClick={() => { setNotificationsOpen(false); router.push('/dashboard/planner'); }} className="w-full border-t border-white/10 px-4 py-3 text-center text-xs font-semibold text-primary hover:bg-white/5">Open Planner</button>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" aria-label="Open profile" aria-expanded={profileOpen} onClick={() => { setProfileOpen((v) => !v); setNotificationsOpen(false); }}>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">{initials}</span>
          </Button>
          {profileOpen && (
            <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-white/10 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
              <div className="mb-1 flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-white">{initials}</span>
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{user?.displayName || 'Student'}</p><p className="truncate text-[11px] text-muted-foreground">{user?.email || ''}</p></div>
              </div>
              <button type="button" onClick={() => { setProfileOpen(false); router.push('/dashboard/settings'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/5"><UserIcon className="h-4 w-4" /> Profile</button>
              <button type="button" onClick={() => { setProfileOpen(false); router.push('/dashboard/settings'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/5"><Settings className="h-4 w-4" /> Settings</button>
              <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
