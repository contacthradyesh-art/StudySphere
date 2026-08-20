'use client';

import Link from 'next/link';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';

interface FocusShieldWidgetProps {
  active: boolean;
  endsAt: number | null;
  blockedCount: number;
  delay?: number;
}

function useCountdown(endsAt: number | null) {
  // Simple static read; the live countdown ticking happens on the Focus Shield page itself.
  if (!endsAt) return '00:00:00';
  const remainingMs = Math.max(0, endsAt - Date.now());
  const totalSec = Math.floor(remainingMs / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/** Compact dashboard preview of the Focus Shield page's live state. */
export function FocusShieldWidget({ active, endsAt, blockedCount, delay }: FocusShieldWidgetProps) {
  const countdown = useCountdown(endsAt);

  return (
    <GlassCard delay={delay} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-white">
          {active ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
        </span>
        <div>
          <h3 className="font-semibold">Focus Shield</h3>
          <p className={cn('text-xs font-medium', active ? 'text-emerald-500' : 'text-muted-foreground')}>
            {active ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      {active ? (
        <>
          <div>
            <p className="text-xs text-muted-foreground">Deep Focus Mode</p>
            <p className="text-3xl font-bold tracking-tight">{countdown}</p>
          </div>
          <Link
            href="/dashboard/focus"
            className="rounded-lg border border-destructive/40 px-4 py-2 text-center text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            End Session
          </Link>
          <p className="text-xs text-muted-foreground">
            Blocking {blockedCount} pattern{blockedCount === 1 ? '' : 's'}
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Not currently active. Start a session to block distractions.
          </p>
          <Link
            href="/dashboard/focus"
            className="rounded-lg bg-gradient-brand px-4 py-2 text-center text-sm font-medium text-white"
          >
            Activate Focus Shield
          </Link>
        </>
      )}
    </GlassCard>
  );
}