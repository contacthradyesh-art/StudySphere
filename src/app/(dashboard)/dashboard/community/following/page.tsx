'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { listFollowing } from '@/lib/community/study-room-service';
import type { CommunityProfile } from '@/lib/firestore/community-schema';

export default function FollowingPage() {
  const { user } = useAuth();
  const [people, setPeople] = useState<CommunityProfile[]>([]);
  useEffect(() => { if (user) listFollowing(user.uid).then(setPeople).catch(()=>setPeople([])); }, [user]);

  return <div className="space-y-5">
    <div><p className="text-xs text-primary">Study Together / Connections</p><h1 className="text-2xl font-black">My study connections</h1><p className="mt-1 text-sm text-muted-foreground">Students you chose to keep connected with.</p></div>
    {people.length === 0 ? <GlassCard><UserPlus className="h-5 w-5 text-primary"/><p className="mt-3 font-semibold">No connections yet</p><p className="mt-1 text-sm text-muted-foreground">Join a room and connect with students preparing for the same exam.</p><Link href="/dashboard/community" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Find students <ArrowRight className="h-4 w-4"/></Link></GlassCard> :
    <div className="grid gap-3 sm:grid-cols-2">{people.map(p=><GlassCard key={p.uid}><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-brand font-bold text-white">{(p.displayName?.[0]||'S').toUpperCase()}</div><div className="min-w-0"><p className="truncate font-semibold">{p.displayName}</p><p className="text-xs text-muted-foreground">{p.exam || 'Student'} · {p.state || 'India'}</p></div></div><p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{p.bio || 'Focused student on StudySphere.'}</p></GlassCard>)}</div>}
  </div>;
}
