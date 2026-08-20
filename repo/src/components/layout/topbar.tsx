'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from '@/lib/auth/service';

export function Topbar() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/[0.06] bg-background/70 px-4 backdrop-blur-xl md:px-6">
      {/* Search Bar */}
      <div className="hidden w-64 items-center gap-2 rounded-full bg-white/5 px-3 py-2 md:flex">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search anything...</span>
        <span className="ml-auto rounded border border-white/10 px-1 text-xs text-muted-foreground">Ctrl K</span>
      </div>

      {/* Right Side */}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-white/5" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/5" aria-label="Profile">
          <UserIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/5" aria-label="Sign out" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}