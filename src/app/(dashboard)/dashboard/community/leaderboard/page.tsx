'use client';

import { useEffect, useState } from 'react';
import { Flame, Clock3, Trophy } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { subscribeCommunityLeaderboard } from '@/lib/community/study-room-service';
import type { CommunityProfile } from '@/lib/firestore/community-schema';

export default function CommunityLeaderboardPage() {
  const [rows, setRows] = useState<CommunityProfile[]>([]);
  useEffect(() => { let stop: (()=>void)|undefined; subscribeCommunityLeaderboard(setRows).then(fn=>stop=fn); return ()=>stop?.(); }, []);
  return <div className="space-y-5">
    <div><p className="text-xs text-primary">Study Together / Progress</p><h1 className="text-2xl font-black">Study streak leaderboard</h1><p className="mt-1 text-sm text-muted-foreground">A public snapshot of community study streaks and logged focus time.</p></div>
    <GlassCard><div className="space-y-2">{rows.length===0 ? <p className="text-sm text-muted-foreground">No public profiles yet.</p> : rows.map((p,i)=><div key={p.uid} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-black text-primary">{i+1}</div><div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">{(p.displayName?.[0]||'S').toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.displayName}</p><p className="text-[11px] text-muted-foreground">{p.exam || 'Student'} · {p.state || 'India'}</p></div><div className="text-right text-xs"><p><Flame className="mr-1 inline h-3.5 w-3.5 text-orange-400"/>{p.streak||0}d</p><p className="text-muted-foreground"><Clock3 className="mr-1 inline h-3.5 w-3.5"/>{Math.round((p.studyMinutes||0)/60)}h</p></div></div>)}</div></GlassCard>
  </div>;
}
