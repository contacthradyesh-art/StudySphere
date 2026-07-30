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
    <header className="glass sticky top-0 z-10 flex h-16 items-center justify-between rounded-none px-4 md:px-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-64 hidden md:flex">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search anything...</span>
        <span className="ml-auto text-xs text-muted-foreground border rounded px-1">Ctrl K</span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1 ml-auto">
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Profile">
          <UserIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Sign out" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}