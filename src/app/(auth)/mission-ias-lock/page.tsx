'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MissionIasLockPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function getRedirect() {
    if (typeof window === 'undefined') return '/dashboard/mission-ias';
    const value = new URLSearchParams(window.location.search).get('redirect');
    return value?.startsWith('/dashboard/mission-ias') ? value : '/dashboard/mission-ias';
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/mission-ias/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not unlock Mission IAS');
      router.replace(getRedirect());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Incorrect password');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <LockKeyhole className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Private Workspace
        </div>
        <h1 className="text-2xl font-bold">Mission IAS is locked</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Enter the owner password to open the complete Mission IAS workspace.
        </p>
      </div>

      <form onSubmit={unlock} className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="mission-ias-password">Mission IAS password</Label>
          <Input
            id="mission-ias-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter owner password"
            required
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" variant="gradient" className="w-full" disabled={busy}>
          {busy ? 'Unlocking…' : 'Unlock Mission IAS'}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        The password is checked on the server and is never stored in the APK.
      </p>
    </div>
  );
}
